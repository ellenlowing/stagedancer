
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
  // const dlleg_ankle = BodyTrackingHelper.getRawDerivative(lleg.ankle);
  // const leftAnkle = await Scene.root.findFirst('leftAnkle');
  // const leftAnkle_emitter = await leftAnkle.findFirst('emitter0');

  // leftAnkle_emitter.birthrate = dlleg_ankle.x.add(dlleg_ankle.y).mul(10).expSmooth(1000);

  // Diagnostics.watch('dllegankle.x', dlleg_ankle.x);
  // Diagnostics.watch('dllegankle.y', dlleg_ankle.y);

  const leftWrist = await Scene.root.findFirst('leftWrist');
  const leftWristLeader = await leftWrist.findFirst('emitterLeader');
  const emitterTransform = await Scene.root.findFirst('leftWristTransform');
  const emitter = await emitterTransform.findFirst('emitter');

  Diagnostics.log(leftWristLeader.name);
  const t1 = leftWrist.worldTransform.toSignal();
  const t0 = t1.history(1).at(0);

  // emitterTransform smoothly follows left wrist of dancer
  // emitterTransform.worldTransform.position = t1.position.expSmooth(30);

  // emitterTransform rotates to emit in the direction of motion
  // const rot = t0.lookAt(t1.position).rotation;
  // const rotValid = t1.position.sub(t0.position).magnitude().gt(0);
  // const rotOrig = emitterTransform.worldTransform.rotation.history(1).at(0);
  // rotValid.monitor().subscribeWithSnapshot(
  //   {
  //     x: rotOrig.x,
  //     y: rotOrig.y,
  //     z: rotOrig.z,
  //     w: rotOrig.w,
  //   },
  //   ({ newValue: valid }, { x, y, z, w }) => {
  //     emitterTransform.worldTransform.rotation = valid ? rot : Reactive.quaternion(w, x, y, z)
  //   },
  // );

  // // spread out emission
  // emitter.positionDelta = Reactive.vector(0.1, 0.1, 0.1);

  // // burst emitterTransform when speed maxes out
  // const dx = t1.position.sub(t0.position).expSmooth(200);
  // const speed = dx.magnitude().abs();
  // const speedNorm = speed.fromRange(0.2, 0.5);

})(); 
