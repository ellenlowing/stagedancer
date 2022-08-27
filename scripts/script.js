
const Scene = require('Scene');
const BodyTracking = require('BodyTracking');
const CameraInfo = require('CameraInfo');
const Reactive = require('Reactive');
const Animation = require('Animation');
const Diagnostics = require('Diagnostics');

import { emit } from 'process';
import BodyTrackingHelper from './BodyTrackingHelper';
import BodyParticles from './BodyParticles';

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

  const [leftWrist, leftWristEmitterTransform] = await Promise.all([
    Scene.root.findFirst('leftWrist'),
    Scene.root.findFirst('leftWristTransform')
  ]);

  const [leftWristEmitter] = await Promise.all([
    leftWristEmitterTransform.findFirst('emitter')
  ]);

  const debugtext = await Scene.root.findFirst('speed');

  const leftWristParticles = new BodyParticles({
    name: 'leftWrist',
    trackedPoint: leftWrist,
    emitterTransform: leftWristEmitterTransform,
    emitter: leftWristEmitter
  })

  leftWristParticles.init()

})(); 
