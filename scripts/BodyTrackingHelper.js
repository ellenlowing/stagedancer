const R = require('Reactive');
const CameraInfo = require('CameraInfo');

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
  body_scale: R.vector(600, 600, 1),
  feet_multiplier: 0.35,
  hand_multiplier: 0.7
};


export default class BodyTrackingHelper {
    static getRawDerivative(pointA) {
        const pAx = pointA.keyPoint.x.expSmooth(config.jnt_smoothing);
        const pAy = pointA.keyPoint.y.expSmooth(config.jnt_smoothing);
        const dpAx = R.derivative(pAx).mul(100000).round().abs()
        const dpAy = R.derivative(pAy).mul(100000).round().abs()
        const dpA = R.pack2(dpAx, dpAy);
        return dpA;
    }

    static getAngleBetweenPoints(pointA, pointB){

        const pAx = pointA.keyPoint.x.mul(config.camera_size.width).expSmooth(config.jnt_smoothing);
        const pAy = pointA.keyPoint.y.mul(config.camera_size.height).expSmooth(config.jnt_smoothing).mul(-1.0);
    
        const pBx = pointB.keyPoint.x.mul(config.camera_size.width).expSmooth(config.jnt_smoothing);
        const pBy = pointB.keyPoint.y.mul(config.camera_size.height).expSmooth(config.jnt_smoothing).mul(-1.0);
    
        const y = pBy.sub(pAy);
        const x = pBx.sub(pAx);
        const angle = R.atan2( y, x);
        return angle;
    }
    
    static getAveragePosition(pointA, pointB){
        const pAx = pointA.keyPoint.x.mul(config.camera_size.width).expSmooth(config.jnt_smoothing);
        const pAy = pointA.keyPoint.y.mul(config.camera_size.height).expSmooth(config.jnt_smoothing).mul(-1.0);
    
        const pBx = pointB.keyPoint.x.mul(config.camera_size.width).expSmooth(config.jnt_smoothing);
        const pBy = pointB.keyPoint.y.mul(config.camera_size.height).expSmooth(config.jnt_smoothing).mul(-1.0);
    
        const averagePosX = pAx.add(pBx).div(2.0);
        const averagePosY = pAy.add(pBy).div(2.0);
        return R.point2d(averagePosX, averagePosY);
    }
    
    static getScale(pointA, pointB){
        var multiplier =  R.distance(pointA.keyPoint, pointB.keyPoint).div(62).expSmooth(config.jnt_smoothing);
        return multiplier.mul(config.body_scale.x).mul(config.camera_size.width);
    }
    
    static offsetPoint(point_a, point_b, multiplier){
        const x = point_b.x.sub(point_a.x).mul(multiplier).add(point_b.x);
        const y = point_b.y.sub(point_a.y).mul(multiplier).add(point_b.y);
    
        return R.point2d(x, y);
    }
    
    static setJointTransform(joint, mainKp, angle, scale, mesh, torsoDep){
        const parentX = mainKp.keyPoint.x.mul(config.camera_size.width).expSmooth(config.jnt_smoothing);
        const parentY = mainKp.keyPoint.y.mul(config.camera_size.height).expSmooth(config.jnt_smoothing).mul(-1.0);
    
        joint.transform.x = parentX;
        joint.transform.y = parentY;
        if(scale == null){
            joint.transform.scale = config.body_scale;
        }
        else{
            joint.transform.scale = scale;
        }
        if(angle != null){
            joint.transform.rotationZ = getAngleBetweenPoints(angle[0], angle[1]);
        }
        if(mesh != null){
            const visibleY = parentY.mul(-1.0).gt(config.safeArea.minY).and(parentY.mul(-1.0).lt(config.safeArea.maxY));
            const visibleX = parentX.gt(config.safeArea.minY).and(parentX.lt(config.safeArea.maxX));
            var hideMesh;
            if(torsoDep == null){
                hideMesh = visibleY.and(visibleX).not().or(hideMeshes);
            }
            else{
                hideMesh = visibleY.and(visibleX).not().or(hideMeshes).or(torsoDep);
            }
            mesh.hidden = hideMesh;
        }
    }
}
