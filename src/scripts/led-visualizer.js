const COLORS_PER_LED = 3;
const WEBSOCKET_IP = "127.0.0.1";
const WEBSOCKET_PORT = 6060;
const WEBSOCKET_BUFFER_TYPE = "arraybuffer";

const DRAW_CIRCLE_RADIUS = 18;

class Color {
    constructor(red, green, blue, alpha = 1.0) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }

    toCss() {
        return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.alpha + ")";
    }
}


class LedVisualizer {
    constructor() {
        this.drawY = 0;
    }

    setupCanvas() {
        this.canvas = document.getElementById('canvas');
        this.context = canvas.getContext('2d');
        this.setFullScreenCanvas();
    }

    setFullScreenCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setGlobalCompositeOperation(type) {
        this.globalCompositeOperation = type;
    }

    drawCircle(x, y, radius, color) {
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = color.toCss();
        this.context.shadowColor = color.toCss();
        this.context.shadowBlur = 25;
        this.context.fill();
    }

    drawRect(x, y, radius, color) {
        this.context.beginPath();
        this.context.rect(x, y, radius, radius);
        this.context.fillStyle = color.toCss();
        this.context.shadowColor = color.toCss();
        this.context.shadowBlur = 25;
        this.context.fill();
    }

    darken() {
        this.context.beginPath();
        this.context.rect(0, 0, canvas.width, canvas.height);
        this.context.fillStyle = new Color(0, 0, 0, 0.8).toCss();
        this.context.fill();
    }

    clear() {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
    }

    setupWebSocket() {
        this.webSocket = new WebSocket(`ws://${WEBSOCKET_IP}:${WEBSOCKET_PORT}`);
        this.webSocket.binaryType = WEBSOCKET_BUFFER_TYPE;
        this.webSocket.onmessage = (event) => {
            this.onMessage(event);
        };
    }

    dataViewToColor(dataView, dataIndex) {
        let red = dataView.getUint8(dataIndex * COLORS_PER_LED);
        let green = dataView.getUint8(dataIndex * COLORS_PER_LED + 1);
        let blue = dataView.getUint8(dataIndex * COLORS_PER_LED + 2);
        return new Color(red, green, blue);
    }

    onMessage(event) {
        const dataView = new DataView(event.data);
        leds = dataView.byteLength / COLORS_PER_LED;
        this.spacing = this.canvas.width / leds;

        for (let i = 0; i < LEDS_NUM; i += 1) {
            const color = this.dataViewToColor(dataView, i);
            this.drawRect((i * this.spacing) + (this.spacing / 2), this.drawY, DRAW_CIRCLE_RADIUS, color);
        }

        this.progressWaterFall();
    }

    progressWaterFall() {
        this.drawY += 3;
        if (this.drawY > this.canvas.height) {
            this.drawY = 0;
            this.darken();
        }
    }

};

export default LedVisualizer;
