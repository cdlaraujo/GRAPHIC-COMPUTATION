const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// 1. VARIÁVEIS DE ESTADO 
// --------------------------------------------------

let cliques = []; 
let p1 = { x: 0, y: 0 };
let p2 = { x: 0, y: 0 }; 


let corAtual = [0.0, 0.0, 1.0]; 

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
// 2. ALGORITMO DE BRESENHAM
// --------------------------------------------------

// Retorna um array [x1, y1, x2, y2, ...] com todos os pixels que formam a reta
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


// --------------------------------------------------
// 3. MOUSE E TECLADO
// --------------------------------------------------

canvas.addEventListener('mousedown', (e) => {
    // Calcula a posição real do clique em relação ao elemento canvas (0 a 600)
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    cliques.push({ x, y });

    // Apenas quando houver dois cliques (início e fim) traçamos a reta
    if (cliques.length === 2) {
        p1 = cliques[0];
        p2 = cliques[1];
        cliques = []; 
        desenharReta();
    }
});

window.addEventListener('keydown', (e) => {
    // Altera a cor se a tecla for um número entre 0 e 9
    if (e.key >= '0' && e.key <= '9') {
        const indice = parseInt(e.key);
        corAtual = paletaCores[indice];
        desenharReta(); 
    }
});


// --------------------------------------------------
// 4. SHADERS 
// --------------------------------------------------

const vertexShaderSource = `#version 300 es
in vec2 aPosition;
uniform vec2 uResolution;

void main() {
    // Conversão das coordenadas (0 a 600) para o clip space do WebGL (-1.0 a +1.0)
    vec2 zeroToOne = aPosition / uResolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    
    // Inverte o eixo Y (o WebGL tem o Y=0 na base, o HTML tem o Y=0 no topo)
    gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
    
    // Tamanho de cada ponto/pixel que será renderizado
    gl_PointSize = 2.0; 
}`;


const fragmentShaderSource = `#version 300 es
precision mediump float;
uniform vec3 uColor;
out vec4 outColor;

void main() {
    // Aplica a cor atual escolhida no teclado
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

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}


// --------------------------------------------------
// 5. PREPARAÇÃO DOS BUFFERS E FUNÇÃO DE DESENHO
// --------------------------------------------------

// Recupera as localizações das variáveis nos shaders
const positionLocation = gl.getAttribLocation(program, "aPosition");
const resLocation = gl.getUniformLocation(program, "uResolution");
const colorLocation = gl.getUniformLocation(program, "uColor");

// Cria um único buffer que será reutilizado
const positionBuffer = gl.createBuffer();


function desenharReta() {
    // 1. Invoca o algoritmo de Bresenham para encontrar todos os pixels
    const arrayPixels = calcularBresenham(p1.x, p1.y, p2.x, p2.y);
    const vertices = new Float32Array(arrayPixels);

    // 2. Envia os pixels calculados para a GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW); 

    // 3. Limpa a tela (cor de fundo cinza escuro)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // 4. Passa a resolução e a cor para a GPU
    gl.uniform2f(resLocation, canvas.width, canvas.height);
    gl.uniform3f(colorLocation, corAtual[0], corAtual[1], corAtual[2]);

    // 5. Configura como a GPU vai ler o buffer de posições
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // 6. Manda desenhar PONTOS (gl.POINTS). 
    // A quantidade de pontos é o tamanho do array dividido por 2 (X e Y)
    gl.drawArrays(gl.POINTS, 0, vertices.length / 2);
}

// --------------------------------------------------
// 6. INICIALIZAÇÃO
// --------------------------------------------------

// Executa o primeiro desenho exigido: reta azul de (0,0) a (0,0)
desenharReta();