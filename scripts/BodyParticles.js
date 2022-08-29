const Reactive = require('Reactive');
const CameraInfo = require('CameraInfo');

export default class BodyParticles {
  constructor({
    name,
    trackedPoint,
    emitterTransform,
    emitter,
    keyPoint,
    speedNormMin = 0.001,
    speedNormMax = 0.02,
    scaleMin = 0.,
    scaleMax = 0.025,
    positionDeltaMax = 0.03,
    birthrateMin = 50,
    birthrateMax = 200
  }) {
    this.name = name
    this.trackedPoint = trackedPoint
    this.emitterTransform = emitterTransform
    this.emitter = emitter
    this.keyPoint = keyPoint
    this.speedNormMin = speedNormMin
    this.speedNormMax = speedNormMax
    this.scaleMin = scaleMin
    this.scaleMax = scaleMax
    this.positionDeltaMax = positionDeltaMax
    this.birthrateMin = birthrateMin
    this.birthrateMax = birthrateMax
  }

  init() {
    const t1 = this.trackedPoint.worldTransform.toSignal();
    const t0 = t1.history(1).at(0);

    // emitterTransform smoothly follows left wrist of dancer
    this.emitterTransform.worldTransform.position = t1.position.expSmooth(30);

    // burst emitterTransform when speed maxes out
    const dx = t1.position.sub(t0.position).expSmooth(200);
    const speed = dx.magnitude().abs();
    const speedNorm = speed.fromRange(this.speedNormMin, this.speedNormMax);
    const emitterScale = speedNorm.toRange(this.scaleMin, this.scaleMax).clamp(this.scaleMin, this.scaleMax);
    const emitterPositionDelta = speedNorm.toRange(0, this.positionDeltaMax).clamp(0.0, this.positionDeltaMax);
    const emitterBirthrate = speedNorm.toRange(this.birthrateMin, this.birthrateMax).clamp(this.birthrateMin, this.birthrateMax);

    // check if body keypoint (normalized) is within bounds
    const visibleX = this.keyPoint.x.gt(0.05).and(this.keyPoint.x.lt(0.95));
    const visibleY = this.keyPoint.y.gt(0.05).and(this.keyPoint.y.lt(0.95));

    // map emitter properties proportional to speed
    this.emitter.scale = emitterScale.expSmooth(30);
    this.emitter.positionDelta = Reactive.vector(emitterPositionDelta, emitterPositionDelta, emitterPositionDelta);
    this.emitter.birthrate = visibleX.and(visibleY).ifThenElse(emitterBirthrate, 0);

  }
}
