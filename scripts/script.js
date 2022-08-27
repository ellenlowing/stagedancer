
const Scene = require('Scene');
const BodyTracking = require('BodyTracking');
const CameraInfo = require('CameraInfo');
const Reactive = require('Reactive');
const Animation = require('Animation');
const Diagnostics = require('Diagnostics');

import { emit } from 'process';
import BodyTrackingHelper from './BodyTrackingHelper';

const width = CameraInfo.previewSize.width.div(CameraInfo.previewScreenScale);
const height = CameraInfo.previewSize.height.div(CameraInfo.previewScreenScale);
const config = {
  camera_size: {
      width:  width,
      height: height},
  safeArea: {
      minX : width.mul(0.05),
      maxX : width.mul(0.95),
      minY : height.mul(0.05),
      maxY : height.mul(0.95)},
  jnt_smoothing: 50,
  body_scale: Reactive.vector(600, 600, 1),
  feet_multiplier: 0.35,
  hand_multiplier: 0.7
};

(async function () { 
  const body = BodyTracking.body(0);
  const pose = body.pose2D;
  const head = pose.head;
  const neck = pose.neck;
  const larm = pose.leftArm;
  const rarm = pose.rightArm;
  const torso = pose.torso;
  const lleg = pose.leftLeg;
  const rleg = pose.rightLeg;

  // const headDist = BodyTrackingHelper.getScale(head.topHead, head.chin).mul(config.camera_size.height.div(config.camera_size.width)).mul(0.88);

  const leftWrist = await Scene.root.findFirst('leftWrist');
  const leftWristLeader = await leftWrist.findFirst('emitterLeader');
  const emitterTransform = await Scene.root.findFirst('leftWristTransform');
  const emitter = await emitterTransform.findFirst('emitter');

  const debugtext = await Scene.root.findFirst('speed');

  const t1 = leftWrist.worldTransform.toSignal();
  const t0 = t1.history(1).at(0);

  // emitterTransform smoothly follows left wrist of dancer
  emitterTransform.worldTransform.position = t1.position.expSmooth(30);

  // burst emitterTransform when speed maxes out
  const dx = t1.position.sub(t0.position).expSmooth(200);
  const speed = dx.magnitude().abs();
  const speedNorm = speed.fromRange(0.001, 0.02);
  const emitterScale = speedNorm.toRange(0, 0.15).clamp(0.0, 0.15);
  const emitterPositionDelta = speedNorm.toRange(0, 0.03).clamp(0.0, 0.03);
  const emitterBirthrate = speedNorm.toRange(50.0, 800.0).clamp(50.0, 800.0);

  debugtext.text = speedNorm.toString();
  Diagnostics.watch('speed', speedNorm);

  // map emitter properties proportional to speed
  emitter.scale = emitterScale.expSmooth(30);
  emitter.positionDelta = Reactive.vector(emitterPositionDelta, emitterPositionDelta, emitterPositionDelta);
  emitter.birthrate = emitterBirthrate;

})(); 
