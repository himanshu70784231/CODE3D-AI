/**
 * CODE3D-AI - Natural Language to 3D Scene Controller (Feature 5)
 * 
 * Strict Pipeline:
 * Natural Language Prompt -> Backend AI API / Generator -> Validated Scene JSON -> Approved R3F Renderer
 * 
 * Strict Security Controls:
 * - Rejects malformed JSON
 * - Enforces allowed 3D primitives only (box, sphere, cylinder, cone, torus, text3d, connection_line, pointer_ring)
 * - Clamps coordinates to [-25, 25] to prevent camera escape
 * - Caps maximum object count (max 60)
 * - Never evaluates arbitrary AI-generated code or scripts
 */

const ALLOWED_PRIMITIVES = new Set([
  'box',
  'sphere',
  'cylinder',
  'cone',
  'torus',
  'text3d',
  'connection_line',
  'pointer_ring',
]);

const ALLOWED_ANIMATIONS = new Set(['none', 'rotate', 'pulse', 'bounce', 'orbit']);

export function validateAndSanitizeScene(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Scene must be a valid JSON object.');
  }

  const sanitized = {
    version: '1.0',
    title: typeof raw.title === 'string' ? raw.title.slice(0, 100) : '3D Scene',
    description: typeof raw.description === 'string' ? raw.description.slice(0, 300) : '',
    camera: {
      position: [0, 4, 14],
      fov: 50,
    },
    lights: [
      { type: 'ambient', intensity: 0.7, color: '#ffffff' },
      { type: 'directional', position: [10, 15, 10], intensity: 1.2, color: '#ffffff' },
    ],
    objects: [],
  };

  // Validate camera
  if (raw.camera && Array.isArray(raw.camera.position) && raw.camera.position.length === 3) {
    sanitized.camera.position = raw.camera.position.map((v) => Math.max(-50, Math.min(50, Number(v) || 0)));
  }

  // Validate objects array (capped at 60)
  const rawObjects = Array.isArray(raw.objects) ? raw.objects.slice(0, 60) : [];

  sanitized.objects = rawObjects.map((obj, index) => {
    const type = ALLOWED_PRIMITIVES.has(String(obj.type).toLowerCase())
      ? String(obj.type).toLowerCase()
      : 'box';

    // Position clamping [-25, 25]
    const pos = Array.isArray(obj.position) && obj.position.length >= 3
      ? obj.position.slice(0, 3).map((n) => Math.max(-25, Math.min(25, Number(n) || 0)))
      : [0, 0, 0];

    // Scale clamping [0.05, 10]
    const scale = Array.isArray(obj.scale) && obj.scale.length >= 3
      ? obj.scale.slice(0, 3).map((n) => Math.max(0.05, Math.min(10, Number(n) || 1)))
      : [1, 1, 1];

    // Rotation
    const rot = Array.isArray(obj.rotation) && obj.rotation.length >= 3
      ? obj.rotation.slice(0, 3).map((n) => Number(n) || 0)
      : [0, 0, 0];

    // Color validation
    let color = typeof obj.color === 'string' && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(obj.color)
      ? obj.color
      : '#38bdf8';

    // Material properties
    const material = {
      color,
      roughness: Math.max(0, Math.min(1, Number(obj.material?.roughness ?? 0.3))),
      metalness: Math.max(0, Math.min(1, Number(obj.material?.metalness ?? 0.2))),
      wireframe: Boolean(obj.material?.wireframe),
      opacity: Math.max(0.1, Math.min(1, Number(obj.material?.opacity ?? 1))),
    };

    // Label
    let label = null;
    if (obj.label && typeof obj.label === 'object') {
      label = {
        text: String(obj.label.text || '').slice(0, 30),
        color: typeof obj.label.color === 'string' ? obj.label.color : '#ffffff',
        offset: Array.isArray(obj.label.offset) ? obj.label.offset.slice(0, 3).map(Number) : [0, 1.2, 0],
      };
    } else if (typeof obj.label === 'string') {
      label = {
        text: obj.label.slice(0, 30),
        color: '#ffffff',
        offset: [0, 1.2, 0],
      };
    }

    // Animation validation
    const animType = ALLOWED_ANIMATIONS.has(String(obj.animation?.type).toLowerCase())
      ? String(obj.animation.type).toLowerCase()
      : 'none';

    const animation = {
      type: animType,
      speed: Math.max(0.1, Math.min(5, Number(obj.animation?.speed || 1))),
      axis: ['x', 'y', 'z'].includes(obj.animation?.axis) ? obj.animation.axis : 'y',
    };

    // Connection line target (for trees / graphs)
    let connectionTarget = null;
    if (type === 'connection_line' && Array.isArray(obj.target) && obj.target.length === 3) {
      connectionTarget = obj.target.map((n) => Math.max(-25, Math.min(25, Number(n) || 0)));
    }

    return {
      id: obj.id ? String(obj.id).slice(0, 40) : `obj_${index}`,
      type,
      position: pos,
      rotation: rot,
      scale,
      material,
      label,
      animation,
      target: connectionTarget,
    };
  });

  return sanitized;
}

/**
 * Procedural Fallback Scene Synthesizer
 * Guarantees rich, validated 3D scenes when AI upstream is offline.
 */
function synthesizeProceduralScene(prompt) {
  const p = prompt.toLowerCase();

  // 1. Binary Tree with N nodes
  if (p.includes('tree') || p.includes('bst')) {
    const nodes = [
      { id: 'node_1', val: 50, x: 0, y: 3.5, z: 0, left: 'node_2', right: 'node_3' },
      { id: 'node_2', val: 30, x: -3.5, y: 1.5, z: 0, left: 'node_4', right: 'node_5' },
      { id: 'node_3', val: 70, x: 3.5, y: 1.5, z: 0, left: 'node_6', right: 'node_7' },
      { id: 'node_4', val: 20, x: -5, y: -0.8, z: 0 },
      { id: 'node_5', val: 40, x: -2, y: -0.8, z: 0 },
      { id: 'node_6', val: 60, x: 2, y: -0.8, z: 0 },
      { id: 'node_7', val: 80, x: 5, y: -0.8, z: 0 },
    ];

    const objects = [];
    nodes.forEach((n) => {
      // Node sphere
      objects.push({
        id: n.id,
        type: 'sphere',
        position: [n.x, n.y, n.z],
        scale: [0.9, 0.9, 0.9],
        material: { roughness: 0.2, metalness: 0.3 },
        color: '#38bdf8',
        label: { text: String(n.val), color: '#ffffff', offset: [0, 0, 1.1] },
        animation: { type: 'pulse', speed: 0.8 },
      });
    });

    // Connection lines
    objects.push({ id: 'edge_1_2', type: 'connection_line', position: [0, 3.5, 0], target: [-3.5, 1.5, 0], color: '#64748b' });
    objects.push({ id: 'edge_1_3', type: 'connection_line', position: [0, 3.5, 0], target: [3.5, 1.5, 0], color: '#64748b' });
    objects.push({ id: 'edge_2_4', type: 'connection_line', position: [-3.5, 1.5, 0], target: [-5, -0.8, 0], color: '#64748b' });
    objects.push({ id: 'edge_2_5', type: 'connection_line', position: [-3.5, 1.5, 0], target: [-2, -0.8, 0], color: '#64748b' });
    objects.push({ id: 'edge_3_6', type: 'connection_line', position: [3.5, 1.5, 0], target: [2, -0.8, 0], color: '#64748b' });
    objects.push({ id: 'edge_3_7', type: 'connection_line', position: [3.5, 1.5, 0], target: [5, -0.8, 0], color: '#64748b' });

    return {
      title: 'Binary Search Tree (7 Nodes)',
      description: '3D Binary Search Tree with hierarchical branch links and balanced elevation.',
      camera: { position: [0, 2, 12], fov: 50 },
      objects,
    };
  }

  // 2. Linked List
  if (p.includes('linked') || p.includes('list')) {
    const count = 5;
    const values = [12, 99, 37, 45, 80];
    const objects = [];

    for (let i = 0; i < count; i++) {
      const x = (i - (count - 1) / 2) * 2.8;
      objects.push({
        id: `node_${i}`,
        type: 'box',
        position: [x, 0, 0],
        scale: [1.4, 1.4, 1.4],
        color: i === 0 ? '#10b981' : i === count - 1 ? '#ef4444' : '#6366f1',
        label: { text: `[${values[i]}]`, color: '#ffffff', offset: [0, 1.2, 0] },
        animation: { type: 'bounce', speed: 1 },
      });

      if (i < count - 1) {
        objects.push({
          id: `pointer_${i}`,
          type: 'cylinder',
          position: [x + 1.4, 0, 0],
          rotation: [0, 0, Math.PI / 2],
          scale: [0.15, 1.0, 0.15],
          color: '#fbbf24',
          label: { text: 'next', color: '#fbbf24', offset: [0, 0.5, 0] },
        });
      }
    }

    return {
      title: 'Singly Linked List with 5 Nodes',
      description: 'Sequential heap nodes connected via directional memory pointers.',
      camera: { position: [0, 1, 12], fov: 50 },
      objects,
    };
  }

  // 3. Stack LIFO
  if (p.includes('stack')) {
    const items = ['Frame #1: main()', 'Frame #2: solve()', 'Frame #3: helper()', 'Frame #4: active'];
    const objects = [];

    items.forEach((txt, idx) => {
      objects.push({
        id: `stack_frame_${idx}`,
        type: 'cylinder',
        position: [0, idx * 1.3 - 1.5, 0],
        scale: [2.5, 0.4, 2.5],
        color: idx === items.length - 1 ? '#f59e0b' : '#3b82f6',
        label: { text: txt, color: '#ffffff', offset: [0, 0.6, 0] },
        animation: idx === items.length - 1 ? { type: 'pulse', speed: 1.2 } : { type: 'none' },
      });
    });

    return {
      title: 'Call Stack Execution Frames',
      description: 'LIFO activation frames stacked vertically in thread memory.',
      camera: { position: [0, 1, 10], fov: 50 },
      objects,
    };
  }

  // 4. Default: 3D Array Bar Chart
  const arr = [15, 30, 55, 42, 68, 24, 78];
  const objects = arr.map((val, idx) => {
    const x = (idx - (arr.length - 1) / 2) * 1.8;
    const h = (val / 80) * 4;
    return {
      id: `bar_${idx}`,
      type: 'box',
      position: [x, h / 2, 0],
      scale: [1.1, h, 1.1],
      color: `hsl(${200 + idx * 25}, 80%, 55%)`,
      label: { text: `${val}`, color: '#ffffff', offset: [0, h / 2 + 0.6, 0] },
      animation: { type: 'bounce', speed: 0.5 + idx * 0.1 },
    };
  });

  return {
    title: 'Dynamic 3D Array Memory Model',
    description: 'Contiguous memory slots with elevation proportional to scalar value.',
    camera: { position: [0, 3, 12], fov: 50 },
    objects,
  };
}

/**
 * POST /api/scene/generate
 * Generates a strictly validated 3D scene from natural language.
 */
export async function generateScene(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PROMPT', message: 'Prompt text is required.' },
      });
    }

    const cleanPrompt = prompt.trim().slice(0, 500);
    const apiKey = process.env.AI_API_KEY || null;
    let rawScene = null;

    if (apiKey) {
      try {
        const systemPrompt = `You are a 3D Graphics Scene Architect for CODE3D-AI.
Generate a valid 3D scene matching this natural language request: "${cleanPrompt}".
Output strictly valid JSON matching this schema:
{
  "title": "Scene Name",
  "description": "Short explanation",
  "camera": { "position": [0, 4, 14], "fov": 50 },
  "objects": [
    {
      "id": "obj_1",
      "type": "box" | "sphere" | "cylinder" | "cone" | "torus" | "connection_line" | "pointer_ring",
      "position": [x, y, z],
      "scale": [sx, sy, sz],
      "rotation": [rx, ry, rz],
      "color": "#38bdf8",
      "label": { "text": "Label", "color": "#ffffff", "offset": [0, 1.2, 0] },
      "animation": { "type": "none" | "rotate" | "pulse" | "bounce" | "orbit", "speed": 1 }
    }
  ]
}
Rules:
1. Coordinates must stay within [-20, 20].
2. Max 30 objects.
3. Only use approved primitive types: box, sphere, cylinder, cone, torus, connection_line, pointer_ring.
4. No scripts, no functions, no eval.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const aiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature: 0.3 },
          }),
        });

        if (aiResponse.ok) {
          const data = await aiResponse.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
          rawScene = JSON.parse(cleaned);
        }
      } catch (aiErr) {
        console.warn('AI Scene Generation fallback:', aiErr.message);
      }
    }

    if (!rawScene) {
      rawScene = synthesizeProceduralScene(cleanPrompt);
    }

    const validatedScene = validateAndSanitizeScene(rawScene);

    return res.json({
      success: true,
      prompt: cleanPrompt,
      scene: validatedScene,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SCENE_GEN_ERROR', message: err.message || 'Failed to generate 3D scene.' },
    });
  }
}
