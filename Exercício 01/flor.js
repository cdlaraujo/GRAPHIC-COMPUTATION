const canvas_flor = document.getElementById("glCanvasFan");
const gl_flor = canvas_flor.getContext("webgl2");

if (!gl_flor) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

let vertices_flor = [];

function circleVertices_flor() {
    const vertices = [];

    // Center point of the circle
    vertices.push(0.0, 0.0);

    // Calculate circle vertices
    const radius = 0.6;
    const numSides = 40;

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

function triangleVertices_flor() {
    return new Float32Array([
         0.0,  0.2,
        -0.2, -0.2,
         0.2, -0.2
    ]);
}


// --------------------------------------------------
// COLORS
// --------------------------------------------------

let colors_flor = [];

function circleColors_flor() {
    let colorValues = [];
    for (let i = 0; i < 42; i++) {
        colorValues.push(1.0, 0.0, 0.0); // Vermelho (pétalas)
    }
    return new Float32Array(colorValues);
}

function triangleColors_flor() {
    let colorValues = [];
    for (let i = 0; i < 3; i++) {
        colorValues.push(1.0, 1.0, 0.0); // Amarelo (miolo)
    }
    return new Float32Array(colorValues);
}


// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer_flor = gl_flor.createBuffer();

const colorsBuffer_flor = gl_flor.createBuffer();

gl_flor.bindBuffer(gl_flor.ARRAY_BUFFER, colorsBuffer_flor);

gl_flor.bufferData(
    gl_flor.ARRAY_BUFFER,
    new Float32Array(colors_flor),
    gl_flor.STATIC_DRAW
);


// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource_flor = `#version 300 es

in vec2 aPosition;
in vec3 aColors;

out vec3 vColors;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColors = aColors;
}

`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource_flor = `#version 300 es

precision mediump float;

in vec3 vColors;

out vec4 outColor;

void main() {
    outColor = vec4(vColors, 1.0);
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader_flor = createShader(
    gl_flor,
    gl_flor.VERTEX_SHADER,
    vertexShaderSource_flor
);

const fragmentShader_flor = createShader(
    gl_flor,
    gl_flor.FRAGMENT_SHADER,
    fragmentShaderSource_flor
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program_flor = gl_flor.createProgram();

gl_flor.attachShader(program_flor, vertexShader_flor);
gl_flor.attachShader(program_flor, fragmentShader_flor);

gl_flor.linkProgram(program_flor);

if (!gl_flor.getProgramParameter(program_flor, gl_flor.LINK_STATUS)) {

    throw new Error(
        gl_flor.getProgramInfoLog(program_flor)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation_flor =
    gl_flor.getAttribLocation(
        program_flor,
        "aPosition"
    );

const colorsLocation_flor =
    gl_flor.getAttribLocation(
        program_flor,
        "aColors"
    );

// --------------------------------------------------
// 8. LIMPAR TELA
// --------------------------------------------------

gl_flor.clearColor(0.1, 0.1, 0.1, 1.0);

gl_flor.clear(gl_flor.COLOR_BUFFER_BIT);

// --------------------------------------------------
// 9. CONFIGURAR ATRIBUTOS (CÍRCULO - PÉTALAS)
// --------------------------------------------------

gl_flor.bindBuffer(gl_flor.ARRAY_BUFFER, verticesBuffer_flor);

vertices_flor = circleVertices_flor();

gl_flor.bufferData(
    gl_flor.ARRAY_BUFFER,
    vertices_flor,
    gl_flor.STATIC_DRAW
);

gl_flor.enableVertexAttribArray(positionLocation_flor);

gl_flor.vertexAttribPointer(
    positionLocation_flor,
    2,
    gl_flor.FLOAT,
    false,
    0,
    0
);

gl_flor.bindBuffer(gl_flor.ARRAY_BUFFER, colorsBuffer_flor);

colors_flor = circleColors_flor();

gl_flor.bufferData(
    gl_flor.ARRAY_BUFFER,
    colors_flor,
    gl_flor.STATIC_DRAW
);

gl_flor.enableVertexAttribArray(colorsLocation_flor);

gl_flor.vertexAttribPointer(
    colorsLocation_flor,
    3,
    gl_flor.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 10. DESENHAR (CÍRCULO - PÉTALAS)
// --------------------------------------------------

gl_flor.useProgram(program_flor);

gl_flor.drawArrays(
    gl_flor.TRIANGLE_FAN,
    0,
    42
);

// --------------------------------------------------
// 11. CONFIGURAR ATRIBUTOS (TRIÂNGULO - MIOLO)
// --------------------------------------------------

gl_flor.bindBuffer(gl_flor.ARRAY_BUFFER, verticesBuffer_flor);

vertices_flor = triangleVertices_flor();

gl_flor.bufferData(
    gl_flor.ARRAY_BUFFER,
    vertices_flor,
    gl_flor.STATIC_DRAW
);

gl_flor.enableVertexAttribArray(positionLocation_flor);

gl_flor.vertexAttribPointer(
    positionLocation_flor,
    2,
    gl_flor.FLOAT,
    false,
    0,
    0
);

gl_flor.bindBuffer(gl_flor.ARRAY_BUFFER, colorsBuffer_flor);

colors_flor = triangleColors_flor();

gl_flor.bufferData(
    gl_flor.ARRAY_BUFFER,
    colors_flor,
    gl_flor.STATIC_DRAW
);

gl_flor.enableVertexAttribArray(colorsLocation_flor);

gl_flor.vertexAttribPointer(
    colorsLocation_flor,
    3,
    gl_flor.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 12. DESENHAR (TRIÂNGULO - MIOLO)
// --------------------------------------------------

gl_flor.useProgram(program_flor);

gl_flor.drawArrays(
    gl_flor.TRIANGLES,
    0,
    3
);