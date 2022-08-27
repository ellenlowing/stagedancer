const Reactive = require('Reactive');
const CameraInfo = require('CameraInfo');
const Scene = require('Scene');

export default class BodyParticles {
  constructor({
    name,
    trackedPoint,
    emitterTransform,
    emitter,
  }) {
    this.name = name
    this.trackedPoint = trackedPoint
    this.emitterTransform = emitterTransform
    this.emitter = emitter
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
    const emitterBirthrate = speedNorm.toRange(50.0, 800.0).clamp(50.0, 800.0);

    // map emitter properties proportional to speed
    this.emitter.scale = emitterScale.expSmooth(30);
    this.emitter.positionDelta = Reactive.vector(emitterPositionDelta, emitterPositionDelta, emitterPositionDelta);
    this.emitter.birthrate = emitterBirthrate;
  }
}
