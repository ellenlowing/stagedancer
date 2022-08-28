const Reactive = require('Reactive');
const CameraInfo = require('CameraInfo');
const Scene = require('Scene');
const Diagnostics = require('Diagnostics');

const width = CameraInfo.previewSize.width.div(CameraInfo.previewScreenScale);
const height = CameraInfo.previewSize.height.div(CameraInfo.previewScreenScale);

export default class BodyParticles {
  constructor({
    name,
    trackedPoint,
    emitterTransform,
    emitter,
    keyPoint
  }) {
    this.name = name
    this.trackedPoint = trackedPoint
    this.emitterTransform = emitterTransform
    this.emitter = emitter
    this.keyPoint = keyPoint
  }

  init() {
    const t1 = this.trackedPoint.worldTransform.toSignal();
    const t0 = t1.history(1).at(0);

    // emitterTransform smoothly follows left wrist of dancer
    this.emitterTransform.worldTransform.position = t1.position.expSmooth(30);

    // burst emitterTransform when speed maxes out
    const dx = t1.position.sub(t0.position).expSmooth(200);
    const speed = dx.magnitude().abs();
    const speedNorm = speed.fromRange(0.001, 0.02);
    const emitterScale = speedNorm.toRange(0, 0.15).clamp(0.0, 0.15);
    const emitterPositionDelta = speedNorm.toRange(0, 0.03).clamp(0.0, 0.03);
    const emitterBirthrate = speedNorm.toRange(50.0, 200.0).clamp(50.0, 200.0);

    // check if body keypoint (normalized) is within bounds
    const visibleX = this.keyPoint.x.gt(0.05).and(this.keyPoint.x.lt(0.95));
    const visibleY = this.keyPoint.y.gt(0.05).and(this.keyPoint.y.lt(0.95));

    // map emitter properties proportional to speed
    this.emitter.scale = emitterScale.expSmooth(30);
    this.emitter.positionDelta = Reactive.vector(emitterPositionDelta, emitterPositionDelta, emitterPositionDelta);
    this.emitter.birthrate = visibleX.and(visibleY).ifThenElse(emitterBirthrate, 0);

  }
}
