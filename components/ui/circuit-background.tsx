'use client';

import { useEffect, useRef } from 'react';

// A rigidly structured Node for orthogonal pipes
interface Node {
    id: string; // "x,y" coordinate string
    x: number;
    y: number;
    parent: Node | null; // Inward to the center
    children: Node[]; // Outward to the edges
    isEdge: boolean;
}

export function CircuitBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let bgCanvas: HTMLCanvasElement;

        let grid = new Map<string, Node>();
        let edgeNodes: Node[] = [];
        let centerNode: Node | null = null;
        let particles: Particle[] = [];

        class Particle {
            node: Node | null = null;
            targetNode: Node | null = null;
            progress: number = 0;
            type: 'inward' | 'outward';
            color: string;
            speed: number;

            constructor() {
                this.type = Math.random() < 0.5 ? 'inward' : 'outward';
                // Water pipeline theme - cyan, sky blue, teal
                const colors = ['rgba(56, 189, 248, 1)', 'rgba(45, 212, 191, 1)', 'rgba(14, 165, 233, 1)'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.speed = 0.3 + Math.random() * 0.4; // Base movement speed multiplier, slowed down
                this.reset();
            }

            reset() {
                if (this.type === 'inward' && edgeNodes.length > 0) {
                    this.node = edgeNodes[Math.floor(Math.random() * edgeNodes.length)];
                    this.targetNode = this.node.parent;
                } else if (centerNode) {
                    this.node = centerNode;
                    if (this.node.children.length > 0) {
                        this.targetNode = this.node.children[Math.floor(Math.random() * this.node.children.length)];
                    } else {
                        this.targetNode = null;
                    }
                }
                this.progress = 0;
            }

            update() {
                if (!this.targetNode || !this.node) {
                    this.type = this.type === 'inward' ? 'outward' : 'inward';
                    this.reset();
                    return;
                }

                const dx = this.targetNode.x - this.node.x;
                const dy = this.targetNode.y - this.node.y;
                const distance = Math.abs(dx) + Math.abs(dy);

                if (distance > 0) {
                    this.progress += (this.speed) / distance;
                } else {
                    this.progress = 1;
                }

                if (this.progress >= 1) {
                    this.progress = 0;
                    this.node = this.targetNode;

                    if (this.type === 'inward') {
                        this.targetNode = this.node.parent;
                        if (!this.targetNode) {
                            // Hit the center
                            this.type = 'outward';
                            this.reset(); // Snap to center and pick a child
                        }
                    } else {
                        if (this.node.children.length > 0) {
                            this.targetNode = this.node.children[Math.floor(Math.random() * this.node.children.length)];
                        } else {
                            // Hit an edge or dead end
                            this.type = 'inward';
                            this.reset(); // Snap back to a random edge
                        }
                    }
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                if (!this.targetNode || !this.node) return;

                const x = this.node.x + (this.targetNode.x - this.node.x) * this.progress;
                const y = this.node.y + (this.targetNode.y - this.node.y) * this.progress;

                ctx.beginPath();
                ctx.arc(x, y, 4.5, 0, Math.PI * 2); // Thicker particles
                ctx.fillStyle = this.color;
                ctx.fill();
                
                // Add a subtle inner glow via a secondary slightly larger arc with low opacity 
                // Much faster than shadowBlur
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2); 
                ctx.fillStyle = this.color.replace('1)', '0.3)'); 
                ctx.fill();
            }
        }

        const buildPipelineNetwork = () => {
            canvas.width = canvas.offsetWidth || window.innerWidth;
            canvas.height = canvas.offsetHeight || 800;

            grid.clear();
            edgeNodes = [];
            particles = [];

            const S = 50; // Grid segment size
            const cx = Math.round((canvas.width / 2) / S) * S;
            const cy = Math.round((canvas.height / 2) / S) * S;

            centerNode = {
                id: `${cx},${cy}`,
                x: cx,
                y: cy,
                parent: null,
                children: [],
                isEdge: false
            };
            grid.set(centerNode.id, centerNode);

            // Generates a path strictly following orthogonal lines to mimic a city pipeline
            const addPath = (startX: number, startY: number) => {
                let x = Math.round(startX / S) * S;
                let y = Math.round(startY / S) * S;
                const path: { x: number, y: number }[] = [];

                let currentDir = Math.random() < 0.5 ? 'x' : 'y';
                let safety = 0;

                while (!grid.has(`${x},${y}`) && safety < 1000) {
                    path.push({ x, y });
                    safety++;

                    const dx = cx - x;
                    const dy = cy - y;

                    if (dx === 0 && dy === 0) break;

                    if (dx === 0) currentDir = 'y';
                    if (dy === 0) currentDir = 'x';

                    // Allow turning to create a pipe/maze aesthetic
                    if (Math.random() > 0.7 && dx !== 0 && dy !== 0) {
                        currentDir = currentDir === 'x' ? 'y' : 'x';
                    }

                    if (currentDir === 'x') {
                        x += Math.sign(dx) * S;
                    } else {
                        y += Math.sign(dy) * S;
                    }
                }

                let parentNode = grid.get(`${x},${y}`);
                if (!parentNode) return;

                // Build nodes backward from join point to the outer edge
                for (let i = path.length - 1; i >= 0; i--) {
                    const pt = path[i];
                    const id = `${pt.x},${pt.y}`;
                    const node: Node = {
                        id,
                        x: pt.x,
                        y: pt.y,
                        parent: parentNode,
                        children: [],
                        isEdge: i === 0
                    };
                    parentNode.children.push(node);
                    grid.set(id, node);
                    if (node.isEdge) {
                        edgeNodes.push(node);
                    }
                    parentNode = node;
                }
            };

            // Inject starting points from the edges to form main tributaries
            for (let x = 0; x <= canvas.width + S; x += S * 1.5) {
                addPath(x, 0);
                addPath(x, canvas.height);
            }
            for (let y = 0; y <= canvas.height + S; y += S * 1.5) {
                addPath(0, y);
                addPath(canvas.width, y);
            }

            // Add some interior starts for extra density
            for (let i = 0; i < 40; i++) {
                addPath(Math.random() * canvas.width, Math.random() * canvas.height);
            }

            // Draw rigid background network visually representing the sewage/pipelines
            bgCanvas = document.createElement('canvas');
            bgCanvas.width = canvas.width;
            bgCanvas.height = canvas.height;
            const bCtx = bgCanvas.getContext('2d');

            if (bCtx) {
                bCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

                // --- 1. Draw Pencil-Style Pipes ---
                // We draw the pipes in two strokes: a thick grey edge and a solid white interior

                // Layer 1: Outer grey edge (pencil-drawn effect)
                bCtx.lineWidth = 14;
                bCtx.lineCap = 'square';
                bCtx.lineJoin = 'miter';
                bCtx.strokeStyle = 'rgba(150, 160, 170, 0.7)'; // Grey edges

                bCtx.beginPath();
                grid.forEach(node => {
                    if (node.parent) {
                        bCtx.moveTo(node.x, node.y);
                        const dx = node.x - node.parent.x;
                        const dy = node.y - node.parent.y;
                        if (dx !== 0 && dy !== 0) {
                            bCtx.lineTo(node.parent.x, node.y);
                        }
                        bCtx.lineTo(node.parent.x, node.parent.y);
                    }
                });
                bCtx.stroke();

                // Layer 2: Solid white inner pipe
                bCtx.lineWidth = 10;
                bCtx.strokeStyle = 'rgba(255, 255, 255, 1)'; // White interior
                bCtx.stroke(); // Fills in the same path drawn above
            }

            // Spawn particles
            for (let i = 0; i < 150; i++) {
                particles.push(new Particle());
            }
        };

        const draw = () => {
            // High-performance canvas clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Paint static pipe network
            if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0);

            // Paint and update active flowing particles
            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            buildPipelineNetwork();
        };

        window.addEventListener('resize', handleResize);
        buildPipelineNetwork();
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
