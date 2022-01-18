"use strict";

function main(){
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');

    if (!gl){
        alert('Unable to initialize WebGL');
        return;
    }

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec3 aNormal;
        
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying vec3 vNormal;
        
        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vNormal = aNormal;
        }
        `;
    const fsSource = `
        precision mediump float;
        varying vec3 vNormal;
        uniform vec3 uLightDirection;
        uniform vec4 uColor;

        void main() {
            vec3 normal = normalize(vNormal);
            float light = dot(normal,uLightDirection) * 0.5 + 1.0;
            gl_FragColor = uColor;
            gl_FragColor.rgb *= light;
     
        }
        `;
    
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition:     gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            normal:             gl.getAttribLocation(shaderProgram, 'aNormal'),
        },
        uniformLocations: {
            projectionMatrix:   gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix:    gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            lightDirection:     gl.getUniformLocation(shaderProgram, 'uLightDirection'),
            color:              gl.getUniformLocation(shaderProgram, 'uColor'),
        },
    };

    const config = {
        DENSITY:            10.0,
        LENGTH:             200.0,
        DAMPENING:          25.0,
        SPRING_CONST:       10000.0,
        GRAVITY:            25.0,
        ROTATION_Y:         0,
        ROTATION_X:         0,
        TIME_PER_UPDATE:    0.06,
        COLOR:              [20.0, 120.0, 190.0, 1],
        LIGHT_DIRECTION:    [1,0.0,-1],
        NUM_OF_NODES:       75,
        NODE_MASS:          40,
        NODE_DISTANCE:      2,
        CONST_DISTANCE:     10,     
    };

    const render = {
        NUM_OF_COMPONENTS:  3,
        TYPE:               gl.FLOAT,
        NORMALIZE:          false,
        STRIDE:             0,
        OFFSET:             0,
    };

    const input = {
        MOUSE_X:            0,
        MOUSE_Y:            0,
        MOUSE_0_DOWN:       false,
        MOUSE_2_DOWN:       false,
        LAST_ROTATION_Y:    0,
        FORCE:              [0,0,0],
    };
    
    const buffers = createCubeBuffers(6);
    const nodes = createNodes(config.NUM_OF_NODES,config.NODE_DISTANCE);
    initMouseInput();
    initGUI();
    requestAnimationFrame(drawScene);

    
    function createNodes(num,dis){
        let nodes = [];
        for (var i = 0; i < num; ++i){ 
            let y = dis*i + gl.canvas.clientHeight*0.8; 
            console.log(y);
            let node = new Node([0.0,y,0.0],m4.identityMatrix());
            nodes.push(node);
        }
        return nodes;
    }


    function createCubeBuffers(hl){
        const cube = [
            hl, hl, hl,
            -hl, hl, hl,
            hl, -hl, hl,
            -hl, -hl, hl,

            hl, hl, -hl,
            -hl, hl, -hl,
            hl, -hl, -hl,
            -hl, -hl, -hl,
            ];
        const normals = [
            1, 1, 1,
            -1, 1, 1,
            1, -1, 1,
            -1, -1, 1,

            1, 1, -1,
            -1, 1, -1,
            1, -1, -1,
            -1, -1, -1,
            ];
        const indices = [
            0, 2, 1,
            3, 1, 2,
    
            4, 5, 6,
            7, 6, 5,
    
            0, 4, 2,
            6, 2, 4,
    
            1, 3, 5,
            7, 5, 3,
    
            0, 4, 1,
            5, 1, 4,
    
            2, 3, 6,
            7, 6, 3,
            ];
        let positionBuffer = gl.createBuffer();
        let normalBuffer = gl.createBuffer();
        let indexBuffer = gl.createBuffer();    
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        return {
            positionBuffer: positionBuffer,
            normalBuffer: normalBuffer,
            indexBuffer: indexBuffer,
        };
    }


    function setColor(v){
        return [v[0]/255.0, v[1]/255.0, v[2]/255.0, v[3]];
    }
      
    
    function drawScene(time){
        resizeCanvasToDisplaySize(gl.canvas)
        let projectionMatrix = m4.projectionMatrix(gl.canvas.width, gl.canvas.height, gl.canvas.width);
        let prevF = input.FORCE;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);    
        gl.clearColor(0.12,0.12,0.14,1);
        gl.useProgram(programInfo.program);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,false,projectionMatrix);
        gl.uniform4fv(programInfo.uniformLocations.color,setColor(config.COLOR));
        gl.uniform3fv(programInfo.uniformLocations.lightDirection,v3.unit(config.LIGHT_DIRECTION));
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition,
            render.NUM_OF_COMPONENTS,
            render.TYPE,
            render.NORMALIZE,
            render.STRIDE,
            render.OFFSET);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
        gl.enableVertexAttribArray(programInfo.attribLocations.normal);
        gl.vertexAttribPointer(programInfo.attribLocations.normal,
            render.NUM_OF_COMPONENTS,
            render.TYPE,
            render.NORMALIZE,
            render.STRIDE,
            render.OFFSET);
    
        for (var i = 0; i < config.NUM_OF_NODES - 1; ++i){
            prevF = nodes[i].update(config, nodes[i+1].vPosition, prevF);
            let m = m4.rotateY(nodes[i].modelViewMatrix, config.ROTATION_Y);
            gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, m);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        }

        let m = m4.rotateY(nodes[config.NUM_OF_NODES-1].modelViewMatrix, config.ROTATION_Y);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, m);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(drawScene);
    }
    

    function initMouseInput(){
        gl.canvas.addEventListener('mousedown', (event) => {
            if (event.button == 0){
                input.MOUSE_X = event.clientX;
                input.MOUSE_Y = event.clientY;
                input.MOUSE_0_DOWN = true;
                input.MOUSE_2_DOWN = false;
            }
            else if (event.button == 2){
                input.MOUSE_X = event.clientX;
                input.MOUSE_Y = event.clientY;
                input.MOUSE_2_DOWN = true;
                input.MOUSE_0_DOWN = false;
                input.LAST_ROTATION_Y = config.ROTATION_Y;
            }
        });

        gl.canvas.addEventListener('mouseup', (event) => {
            if (event.button == 0){
                input.MOUSE_0_DOWN = false;
                input.FORCE = [0,0,0];
            }
            else if (event.button == 2){
                input.MOUSE_2_DOWN = false;
            }
        });

        gl.canvas.addEventListener('mousemove', (event) => {
            if (input.MOUSE_0_DOWN){
                input.FORCE[0] = (event.clientX-input.MOUSE_X)*100;
                input.FORCE = v3.rotateY(input.FORCE, config.ROTATION_Y);
            }
            else if (input.MOUSE_2_DOWN){
                config.ROTATION_Y = input.LAST_ROTATION_Y + input.MOUSE_X - event.clientX;
            } 
        });

        gl.canvas.addEventListener('mouseleave', (event) => {
            input.MOUSE_0_DOWN = false;
            input.MOUSE_2_DOWN = false;
            input.FORCE = [0,0,0];

        })
    }


    function initGUI(){
        let params = {
            name: 'Configuration',
            autoPlace: false,
        };
        var gui = new dat.GUI(params);
        var container = document.getElementById('gui');
        container.appendChild(gui.domElement);
        gui.add(config, 'GRAVITY', 0, 50).name('Gravity');
        gui.add(config, 'DAMPENING', 0, 50).name('Dampening');
        gui.add(config, 'SPRING_CONST', 1000, 10000).name('Spring Constant');
        gui.add(config, 'TIME_PER_UPDATE', 0.01, 0.06).name('Time Step');
        gui.addColor(config, 'COLOR').name('Color');
    }
}

function Node(position, matrix){
    this.vPosition = position;
    this.vPrevPosition = position;
    this.velocity = [0,0,0];
    this.modelViewMatrix = m4.translate(matrix, position);

    this.update = function(config, vNextPos, vPrevF){
        let vDistance = v3.subtract(vNextPos,this.vPosition);
        let distance = v3.magnitude(vDistance);
        var vNextF = [0,0,0];
        
        if (distance > config.CONST_DISTANCE){
            let vUnit = v3.divSca(vDistance,distance);
            let vConstDistance = v3.multSca(vUnit,config.CONST_DISTANCE);
            let vNodeDistance = v3.multSca(vUnit,config.NODE_DISTANCE);
            vNextF = v3.multSca(v3.subtract(vConstDistance,vNodeDistance),config.SPRING_CONST);
        }
        else if (distance > config.NODE_DISTANCE){
            let vUnit = v3.divSca(vDistance,distance);
            let vNodeDistance = v3.multSca(vUnit,config.NODE_DISTANCE);
            vNextF = v3.multSca(v3.subtract(vDistance,vNodeDistance),config.SPRING_CONST);
        }
      
        let vDampF = v3.multSca(v3.reverse(this.velocity),config.DAMPENING);
        let vGravF = [0.0, -config.NODE_MASS*config.GRAVITY, 0.0];
        let F = v3.add(vNextF,vPrevF);
        F = v3.add(F,vDampF);
        F = v3.add(F,vGravF);

        let vTranslation = v3.divSca(F,config.NODE_MASS/(config.TIME_PER_UPDATE**2));
        vTranslation = v3.add(v3.multSca(this.vPosition,2),vTranslation);
        vTranslation = v3.subtract(vTranslation,this.vPrevPosition);
        this.vPrevPosition = this.vPosition;
        this.vPosition = vTranslation;

        vDistance = v3.subtract(vNextPos, vTranslation);
        distance = v3.magnitude(vDistance);
        if (distance > config.CONST_DISTANCE){
            let vUnit = v3.divSca(vDistance,distance);
            let vConstDistance = v3.multSca(vUnit,config.CONST_DISTANCE);
            this.vPosition = v3.add(this.vPosition,v3.subtract(vDistance,vConstDistance));
        }

        this.velocity = v3.divSca(v3.subtract(this.vPosition,this.vPrevPosition),config.TIME_PER_UPDATE);
        this.modelViewMatrix = m4.translate(m4.identityMatrix(),vTranslation);

        return v3.reverse(vNextF);
    }
    
}

main();