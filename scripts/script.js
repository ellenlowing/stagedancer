
const Scene = require('Scene');
const BodyTracking = require('BodyTracking');
const CameraInfo = require('CameraInfo');
const Reactive = require('Reactive');
const Animation = require('Animation');
const Diagnostics = require('Diagnostics');
const Blocks = require('Blocks');
const Time = require('Time');
const Patches = require('Patches');
const Materials = require('Materials');

import { emit } from 'process';
import BodyTrackingHelper from './BodyTrackingHelper';
import BodyParticles from './BodyParticles';

const width = CameraInfo.previewSize.width.div(CameraInfo.previewScreenScale);
const height = CameraInfo.previewSize.height.div(CameraInfo.previewScreenScale);
const config = {
  camera_size: {
      width:  width,
      height: height
    },
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

  const [
    emitters,
    spotlightCone,
    spotlightPlane,
    spotlightPlaneMat,
    leftWrist, 
    leftWristEmitterTransform,
    rightWrist,
    rightWristEmitterTransform,
    leftAnkle, 
    leftAnkleEmitterTransform,
    rightAnkle,
    rightAnkleEmitterTransform,
    topHead,
    topHeadEmitterTransform,
    leftShoulder,
    leftShoulderEmitterTransform,
    rightShoulder,
    rightShoulderEmitterTransform,
    leftKnee,
    leftKneeEmitterTransform,
    rightKnee,
    rightKneeEmitterTransform
  ] = await Promise.all([
    Scene.root.findFirst('emitters'),
    Scene.root.findFirst('spotlightCone'),
    Scene.root.findFirst('spotlightPlane'),
    Materials.findFirst('spotlightPlane'),
    Scene.root.findFirst('leftWrist'),
    Scene.root.findFirst('leftWristTransform'),
    Scene.root.findFirst('rightWrist'),
    Scene.root.findFirst('rightWristTransform'),
    Scene.root.findFirst('leftAnkle'),
    Scene.root.findFirst('leftAnkleTransform'),
    Scene.root.findFirst('rightAnkle'),
    Scene.root.findFirst('rightAnkleTransform'),
    Scene.root.findFirst('topHead'),
    Scene.root.findFirst('topHeadTransform'),
    Scene.root.findFirst('leftShoulder'),
    Scene.root.findFirst('leftShoulderTransform'),
    Scene.root.findFirst('rightShoulder'),
    Scene.root.findFirst('rightShoulderTransform'),
    Scene.root.findFirst('leftKnee'),
    Scene.root.findFirst('leftKneeTransform'),
    Scene.root.findFirst('rightKnee'),
    Scene.root.findFirst('rightKneeTransform'),
  ]);

  const [
    leftWristEmitter,
    rightWristEmitter,
    leftAnkleEmitter,
    rightAnkleEmitter,
    topHeadEmitter,
    leftShoulderEmitter,
    rightShoulderEmitter,
    leftKneeEmitter,
    rightKneeEmitter
  ] = await Promise.all([
    leftWristEmitterTransform.findFirst('emitter'),
    rightWristEmitterTransform.findFirst('emitter'),
    leftAnkleEmitterTransform.findFirst('emitter'),
    rightAnkleEmitterTransform.findFirst('emitter'),
    topHeadEmitterTransform.findFirst('emitter'),
    leftShoulderEmitterTransform.findFirst('emitter'),
    rightShoulderEmitterTransform.findFirst('emitter'),
    leftKneeEmitterTransform.findFirst('emitter'),
    rightKneeEmitterTransform.findFirst('emitter'),
  ]);

  const debugtext = await Scene.root.findFirst('speed');

  // initialize BodyParticles / emitter for different body parts
  const leftWristParticles = new BodyParticles({
    name: 'leftWristParticles',
    trackedPoint: leftWrist,
    emitterTransform: leftWristEmitterTransform,
    emitter: leftWristEmitter,
    keyPoint: larm.wrist.keyPoint,
    scaleMax: 0.01
  });
  const rightWristParticles = new BodyParticles({
    name: 'rightWristParticles',
    trackedPoint: rightWrist,
    emitterTransform: rightWristEmitterTransform,
    emitter: rightWristEmitter,
    keyPoint: rarm.wrist.keyPoint,
    scaleMax: 0.01
  });
  const leftAnkleParticles = new BodyParticles({
    name: 'leftAnkleParticles',
    trackedPoint: leftAnkle,
    emitterTransform: leftAnkleEmitterTransform,
    emitter: leftAnkleEmitter,
    keyPoint: lleg.ankle.keyPoint
  });
  const rightAnkleParticles = new BodyParticles({
    name: 'rightAnkleParticles',
    trackedPoint: rightAnkle,
    emitterTransform: rightAnkleEmitterTransform,
    emitter: rightAnkleEmitter,
    keyPoint: rleg.ankle.keyPoint
  });
  const topHeadParticles = new BodyParticles({
    name: 'topHeadParticles',
    trackedPoint: topHead,
    emitterTransform: topHeadEmitterTransform,
    emitter: topHeadEmitter,
    keyPoint: head.topHead.keyPoint
  });
  const leftShoulderParticles = new BodyParticles({
    name: 'leftShoulderParticles',
    trackedPoint: leftShoulder,
    emitterTransform: leftShoulderEmitterTransform,
    emitter: leftShoulderEmitter,
    keyPoint: larm.shoulder.keyPoint
  });
  const rightShoulderParticles = new BodyParticles({
    name: 'rightShoulderParticles',
    trackedPoint: rightShoulder,
    emitterTransform: rightShoulderEmitterTransform,
    emitter: rightShoulderEmitter,
    keyPoint: rarm.shoulder.keyPoint
  });
  const leftKneeParticles = new BodyParticles({
    name: 'leftKneeParticles',
    trackedPoint: leftKnee,
    emitterTransform: leftKneeEmitterTransform,
    emitter: leftKneeEmitter,
    keyPoint: lleg.knee.keyPoint
  });
  const rightKneeParticles = new BodyParticles({
    name: 'rightKneeParticles',
    trackedPoint: rightKnee,
    emitterTransform: rightKneeEmitterTransform,
    emitter: rightKneeEmitter,
    keyPoint: rleg.knee.keyPoint
  });

  leftWristParticles.init();
  rightWristParticles.init();
  leftAnkleParticles.init();
  rightAnkleParticles.init();
  topHeadParticles.init();
  leftShoulderParticles.init();
  rightShoulderParticles.init();
  leftKneeParticles.init();
  rightKneeParticles.init();
  
  // hide emitters if body is not tracked
  emitters.hidden = Time.ms.lt(3000).or(body.isTracked.not());

  // animate opening spotlight
  const openingTimeDriver = Animation.timeDriver({
    durationMilliseconds: 1500,
    loopCount: 1,
    mirror: false
  });

  const openingSpotlightPlaneSampler = Animation.samplers.easeInOutQuad(0, 0.08);
  const openingSpotlightPlaneAnimation = Animation.animate(openingTimeDriver, openingSpotlightPlaneSampler);
  const openingSpotlightPlaneIntensitySampler = Animation.samplers.easeOutExpo(0., 1.);
  const openingSpotlightPlaneIntensityAnimation = Animation.animate(openingTimeDriver, openingSpotlightPlaneIntensitySampler);
  Patches.inputs.setScalar('spotlightPlaneRadius', openingSpotlightPlaneAnimation);
  spotlightPlaneMat.setParameter('intensity', openingSpotlightPlaneIntensityAnimation);

  const openingSpotlightConeWidthSampler = Animation.samplers.easeInOutQuad(0, 1.);
  const openingSpotlightConeWidthAnimation = Animation.animate(openingTimeDriver, openingSpotlightConeWidthSampler);
  const openingSpotlightConeIntensitySampler = Animation.samplers.easeOutExpo(0., 1.);
  const openingSpotlightConeIntensityAnimation = Animation.animate(openingTimeDriver, openingSpotlightConeIntensitySampler);
  spotlightCone.inputs.setScalar('width', openingSpotlightConeWidthAnimation);
  spotlightCone.inputs.setScalar('intensity', openingSpotlightConeIntensityAnimation);

  openingTimeDriver.start();
})(); 
