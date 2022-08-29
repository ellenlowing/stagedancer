
const Scene = require('Scene');
const BodyTracking = require('BodyTracking');
const CameraInfo = require('CameraInfo');
const Reactive = require('Reactive');
const Animation = require('Animation');
const Patches = require('Patches');
const Time = require('Time');
const Materials = require('Materials');

import { emit } from 'process';
import BodyParticles from './BodyParticles';

(async function () { 
  const body = BodyTracking.body(0);
  const pose = body.pose2D;
  const larm = pose.leftArm;
  const rarm = pose.rightArm;
  const lleg = pose.leftLeg;
  const rleg = pose.rightLeg;
  Patches.inputs.setBoolean('ready', Reactive.val(false));

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
    rightAnkleEmitterTransform
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
    Scene.root.findFirst('rightAnkleTransform')
  ]);

  const [
    leftWristEmitter,
    rightWristEmitter,
    leftAnkleEmitter,
    rightAnkleEmitter
  ] = await Promise.all([
    leftWristEmitterTransform.findFirst('emitter'),
    rightWristEmitterTransform.findFirst('emitter'),
    leftAnkleEmitterTransform.findFirst('emitter'),
    rightAnkleEmitterTransform.findFirst('emitter')
  ]);

  // initialize BodyParticles / emitter for different body parts
  const leftWristParticles = new BodyParticles({
    name: 'leftWristParticles',
    trackedPoint: leftWrist,
    emitterTransform: leftWristEmitterTransform,
    emitter: leftWristEmitter,
    keyPoint: larm.wrist.keyPoint,
    scaleMax: 0.02
  });
  const rightWristParticles = new BodyParticles({
    name: 'rightWristParticles',
    trackedPoint: rightWrist,
    emitterTransform: rightWristEmitterTransform,
    emitter: rightWristEmitter,
    keyPoint: rarm.wrist.keyPoint,
    scaleMax: 0.02
  });
  const leftAnkleParticles = new BodyParticles({
    name: 'leftAnkleParticles',
    trackedPoint: leftAnkle,
    emitterTransform: leftAnkleEmitterTransform,
    emitter: leftAnkleEmitter,
    keyPoint: lleg.ankle.keyPoint,
    scaleMax: 0.02
  });
  const rightAnkleParticles = new BodyParticles({
    name: 'rightAnkleParticles',
    trackedPoint: rightAnkle,
    emitterTransform: rightAnkleEmitterTransform,
    emitter: rightAnkleEmitter,
    keyPoint: rleg.ankle.keyPoint,
    scaleMax: 0.02
  });

  leftWristParticles.init();
  rightWristParticles.init();
  leftAnkleParticles.init();
  rightAnkleParticles.init();
  
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

  Patches.inputs.setBoolean('ready', Reactive.val(true));
  openingTimeDriver.start();
})(); 
