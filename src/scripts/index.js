import '../styles/index.scss';
import LedVisualizer from './led-visualizer';

let ledVisualizer = new LedVisualizer();
ledVisualizer.setupCanvas();
ledVisualizer.setupWebSocket();
