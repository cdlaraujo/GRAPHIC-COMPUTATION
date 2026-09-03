const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// 1. VARIÁVEIS DE ESTADO
// --------------------------------------------------

let modoAtual = 'R'; // 'R' = Reta (2 cliques) | 'T' = Triângulo (3 cliques)
let cliques = []; // Guarda os cliques temporários
let pontosFigura = [{ x: 0, y: 0 }, { x: 0, y: 0 }]; // Figura inicial (0,0)-(0,0)

// Cor inicial: Azul
let corAtual = [0.0, 0.0, 1.0];

// Paleta de 10 cores (Teclas 0-9)
const paletaCores = [
    [0.0, 0.0, 0.0], // 0: Preto
    [1.0, 0.0, 0.0], // 1: Vermelho
    [0.0, 1.0, 0.0], // 2: Verde
    [0.0, 0.0, 1.0], // 3: Azul
    [1.0, 1.0, 0.0], // 4: Amarelo
    [1.0, 0.0, 1.0], // 5: Magenta
    [0.0, 1.0, 1.0], // 6: Ciano
    [1.0, 0.5, 0.0], // 7: Laranja
    [0.5, 0.0, 0.5], // 8: Roxo
    [0.5, 0.5, 0.5]  // 9: Cinza
];

// --------------------------------------------------
// 2. ALGORITMOS DE BRESENHAM
// --------------------------------------------------

function calcularBresenham(x1, y1, x2, y2) {
    const pixels = [];
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = (x1 < x2) ? 1 : -1;
    let sy = (y1 < y2) ? 1 : -1;
    let erro = dx - dy;

    while (true) {
        pixels.push(x1, y1);
        if (x1 === x2 && y1 === y2) break;
        
        let e2 = 2 * erro;
        if (e2 > -dy) { 
            erro -= dy; 
            x1 += sx; 
        }
        if (e2 < dx) { 
            erro += dx; 
            y1 += sy; 
        }
    }
    return pixels;
}

function calcularTriangulo(p1, p2, p3) {
    const lado1 = calcularBresenham(p1.x, p1.y, p2.x, p2.y);
    const lado2 = calcularBresenham(p2.x, p2.y, p3.x, p3.y);
    const lado3 = calcularBresenham(p3.x, p3.y, p1.x, p1.y);
    return lado1.concat(lado2, lado3);
}

// --------------------------------------------------
// 3. EVENTOS DE MOUSE E TECLADO
// --------------------------------------------------

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    
    // Converte a posição do clique para o tamanho interno do Canvas (600x600)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    cliques.push({ x, y });

    // Modo Reta: 2 cliques
    if (modoAtual === 'R' && cliques.length === 2) {
        pontosFigura = [...cliques];
        cliques = [];
    } 
    // Modo Triângulo: 3 cliques
    else if (modoAtual === 'T' && cliques.length === 3) {
        pontosFigura = [...cliques];
        cliques = [];
    }
    
    desenharFigura();
});

window.addEventListener('keydown', (e) => {
    const tecla = e.key.toLowerCase();

    if (tecla === 'r') {
        modoAtual = 'R';
        cliques = [];
        desenharFigura();
    } else if (tecla === 't') {
        modoAtual = 'T';
        cliques = [];
        desenharFigura();
    } else if (e.key >= '0' && e.key <= '9') {
        const indice = parseInt(e.key);
        corAtual = paletaCores[indice];
        desenharFigura();
    }
});

// --------------------------------------------------
// 4. SHADERS WEBGL
// --------------------------------------------------

const vertexShaderSource = `#version 300 es
in vec2 aPosition;
uniform vec2 uResolution;

void main() {
    vec2 zeroToOne = aPosition / uResolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    
    gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
    gl_PointSize = 6.0; // Pontos maiores para facilitar a visualização
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
uniform vec3 uColor;
out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// --------------------------------------------------
// 5. RENDERIZAÇÃO
// --------------------------------------------------

const positionLocation = gl.getAttribLocation(program, "aPosition");
const resLocation = gl.getUniformLocation(program, "uResolution");
const colorLocation = gl.getUniformLocation(program, "uColor");
const positionBuffer = gl.createBuffer();

function desenharFigura() {
    let arrayPixels = [];

    if (modoAtual === 'R') {
        const p1 = pontosFigura[0] || { x: 0, y: 0 };
        const p2 = pontosFigura[1] || { x: 0, y: 0 };
        arrayPixels = calcularBresenham(p1.x, p1.y, p2.x, p2.y);
    } else if (modoAtual === 'T') {
        if (pontosFigura.length === 3) {
            arrayPixels = calcularTriangulo(pontosFigura[0], pontosFigura[1], pontosFigura[2]);
        }
    }

    // Se houver cliques pendentes (em progresso), adiciona os pontos para dar feedback visual
    for (let c of cliques) {
        arrayPixels.push(c.x, c.y);
    }

    const vertices = new Float32Array(arrayPixels);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Ajusta o viewport para o tamanho real do canvas
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Limpa a tela com fundo cinza escuro
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform2f(resLocation, canvas.width, canvas.height);
    gl.uniform3f(colorLocation, corAtual[0], corAtual[1], corAtual[2]);

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    if (vertices.length > 0) {
        gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
    }
}

// Inicializa o primeiro desenho
desenharFigura();