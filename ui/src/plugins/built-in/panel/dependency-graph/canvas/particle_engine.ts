import CanvasDrawer from "./graph_canvas";
import _, { defaultTo } from 'lodash';
import { Particles, Particle, IGraphMetrics } from "../types";

export default class ParticleEngine {

    drawer: CanvasDrawer;

    maxVolume: number = 1000;

    minSpawnPropability: number = 0.01;

    spawnInterval: any;
    
    constructor(canvasDrawer: CanvasDrawer) {
        this.drawer = canvasDrawer;
    }

    start() {
        if (!this.spawnInterval) {
            const that = this;
            this.spawnInterval = setInterval(() => that._spawnParticles(), 100);
        }
    }

    stop() {
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
    }

    _spawnParticles() {
        const cy = this.drawer.cytoscape;

        const now = Date.now();

        cy.edges().forEach(edge => {
            let particles: Particles = edge.data('particles');
            const metrics: IGraphMetrics = edge.data('metrics');

            if (!metrics) {
                return;
            }

            const requests = defaultTo(metrics.requests, 0);
            const errors = defaultTo(metrics.errors, 0);
            const volume = requests + errors;

            let errorRate;
            if (requests > 0 && errors >= 0) {
                errorRate = errors / requests;
            } else {
                errorRate = 0;
            }

            if (particles === undefined) {
                particles = {
                    normal: [],
                    danger: []
                };
                edge.data('particles', particles);
            }

            if (metrics && volume > 0) {
                const spawnPropability = Math.min(volume / this.maxVolume, 1.0);

                for (let i = 0; i < 5; i++) {
                    if (Math.random() <= spawnPropability + this.minSpawnPropability) {
                        const particle: Particle = {
                            velocity: 0.05 + (Math.random() * 0.05),
                            startTime: now
                        };

                        if (Math.random() < errorRate) {
                            particles.danger.push(particle);
                        } else {
                            particles.normal.push(particle);
                        }
                    }
                }
            }
        });
    }

    count() {
        const cy = this.drawer.cytoscape;

        const count = _(cy.edges())
            .map(edge => edge.data('particles'))
            .filter()
            .map(particleArray => particleArray.normal.length + particleArray.danger.length)
            .sum();

        return count;
    }
}