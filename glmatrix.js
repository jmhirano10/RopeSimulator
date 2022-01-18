var m4 = {
    projectionMatrix:function(width, height, depth){
        return[
            2/width, 0, 0, 0,
            0, 2/height, 0, 0,
            0, 0, 2/depth, 0,
            0, -1, 0, 1,
        ];
    },
    identityMatrix:function(){
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },
    translate:function(m,t){
        let tran = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            t[0], t[1], t[2], 1,
        ];
        return m4.multiply(m,tran);
    },
    rotateY:function(m,a){
        let rad = a*Math.PI/180;
        let s = Math.sin(rad);
        let c = Math.cos(rad);
        let rot = [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ]
        return m4.multiply(m,rot);
    },
    multiply:function(m1, m2){
        let m11 = m1[0]*m2[0] + m1[1]*m2[4] + m1[2]*m2[8] + m1[3]*m2[12];
        let m12 = m1[0]*m2[1] + m1[1]*m2[5] + m1[2]*m2[9] + m1[3]*m2[13];
        let m13 = m1[0]*m2[2] + m1[1]*m2[6] + m1[2]*m2[10] + m1[3]*m2[14];
        let m14 = m1[0]*m2[3] + m1[1]*m2[7] + m1[2]*m2[11] + m1[3]*m2[15];

        let m21 = m1[4]*m2[0] + m1[5]*m2[4] + m1[6]*m2[8] + m1[7]*m2[12];
        let m22 = m1[4]*m2[1] + m1[5]*m2[5] + m1[6]*m2[9] + m1[7]*m2[13];
        let m23 = m1[4]*m2[2] + m1[5]*m2[6] + m1[6]*m2[10] + m1[7]*m2[14];
        let m24 = m1[4]*m2[3] + m1[5]*m2[7] + m1[6]*m2[11] + m1[7]*m2[15];

        let m31 = m1[8]*m2[0] + m1[9]*m2[4] + m1[10]*m2[8] + m1[11]*m2[12];
        let m32 = m1[8]*m2[1] + m1[9]*m2[5] + m1[10]*m2[9] + m1[11]*m2[13];
        let m33 = m1[8]*m2[2] + m1[9]*m2[6] + m1[10]*m2[10] + m1[11]*m2[14];
        let m34 = m1[8]*m2[3] + m1[9]*m2[7] + m1[10]*m2[11] + m1[11]*m2[15];

        let m41 = m1[12]*m2[0] + m1[13]*m2[4] + m1[14]*m2[8] + m1[15]*m2[12];
        let m42 = m1[12]*m2[1] + m1[13]*m2[5] + m1[14]*m2[9] + m1[15]*m2[13];
        let m43 = m1[12]*m2[2] + m1[13]*m2[6] + m1[14]*m2[10] + m1[15]*m2[14];
        let m44 = m1[12]*m2[3] + m1[13]*m2[7] + m1[14]*m2[11] + m1[15]*m2[15];

        return [
            m11, m12, m13, m14,
            m21, m22, m23, m24,
            m31, m32, m33, m34,
            m41, m42, m43, m44,
        ];
    }
    
}

var v3 = {
    add:function(v1,v2){
        let x = v1[0] + v2[0];
        let y = v1[1] + v2[1];
        let z = v1[2] + v2[2];
        return [x, y, z];
    },
    subtract:function(v1,v2){
        let x = v1[0] - v2[0];
        let y = v1[1] - v2[1];
        let z = v1[2] - v2[2];
        return [x, y, z];
    },
    multMat:function(v,m){
        let x = v[0]*m[0] + v[1]*m[3] + v[2]*m[6];
        let y = v[0]*m[1] + v[1]*m[4] + v[2]*m[7];
        let z = v[0]*m[2] + v[1]*m[5] + v[2]*m[8];
        return [x, y, z];
    },
    multSca:function(v,s){
        let x = s*v[0];
        let y = s*v[1];
        let z = s*v[2];
        return [x, y, z];
    },
    divSca:function(v,s){
        let x = v[0]/s;
        let y = v[1]/s;
        let z = v[2]/s;
        return [x, y, z];
    },
    rotateY:function(v,a){
        let rad = a*Math.PI/180;
        let s = Math.sin(rad);
        let c = Math.cos(rad);
        let rot = [
            c, 0, s,
            0, 1, 0,
            -s, 0, c,
        ];
        return v3.multMat(v,rot);
    },
    magnitude:function(v){
        return Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
    },
    reverse:function(v){
        return [-v[0], -v[1], -v[2]];
    },
    unit:function(v){
        let mag = v3.magnitude(v);
        return v3.divSca(v,mag); 
    }
}