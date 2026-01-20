<template>
  <div class="annotate-container">
    <a-typography-title :level="2">图片标注</a-typography-title>
    <a-typography-paragraph>
      基础图片标注工具，支持矩形、圆形、箭头等形状，支持颜色选择和导出。
    </a-typography-paragraph>

    <div class="toolbar">
      <a-space>
        <a-radio-group v-model:value="tool" button-style="solid">
          <a-radio-button value="rect">矩形</a-radio-button>
          <a-radio-button value="circle">圆形</a-radio-button>
          <a-radio-button value="arrow">箭头</a-radio-button>
        </a-radio-group>

        <a-input
          type="color"
          v-model:value="color"
          style="width: 50px; padding: 0"
        />

        <a-upload :before-upload="handleUpload" :show-upload-list="false">
          <a-button>上传图片</a-button>
        </a-upload>

        <a-button type="primary" @click="exportImage">导出图片</a-button>
        <a-button @click="exportJSON">导出JSON</a-button>
        <a-button danger @click="clearCanvas">清空</a-button>
      </a-space>
    </div>

    <div class="canvas-wrapper" ref="wrapper">
      <canvas
        ref="canvasRef"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { message } from "ant-design-vue";

const tool = ref("rect");
const color = ref("#ff4d4f");
const canvasRef = ref<HTMLCanvasElement | null>(null);
const wrapper = ref<HTMLDivElement | null>(null);
const isDrawing = ref(false);
const startPos = reactive({ x: 0, y: 0 });
const shapes = ref<any[]>([]);
const backgroundImage = ref<HTMLImageElement | null>(null);

const handleUpload = (file: File) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target?.result as string;
    img.onload = () => {
      backgroundImage.value = img;
      setTimeout(() => {
        resizeCanvas();
        render();
      }, 0);
    };
  };
  return false;
};

const resizeCanvas = () => {
  if (!canvasRef.value || !wrapper.value || !backgroundImage.value) return;
  const canvas = canvasRef.value;
  const containerWidth = wrapper.value.clientWidth;
  const ratio = containerWidth / backgroundImage.value.width;
  canvas.width = containerWidth;
  canvas.height = backgroundImage.value.height * ratio;
};

const render = () => {
  if (!canvasRef.value || !backgroundImage.value) return;
  const ctx = canvasRef.value.getContext("2d")!;
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  // Draw background
  ctx.drawImage(
    backgroundImage.value,
    0,
    0,
    canvasRef.value.width,
    canvasRef.value.height,
  );

  // Draw shapes
  shapes.value.forEach((shape) => drawShape(ctx, shape));
};

const drawShape = (ctx: CanvasRenderingContext2D, shape: any) => {
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (shape.type === "rect") {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  } else if (shape.type === "circle") {
    const radius = Math.sqrt(
      Math.pow(shape.width, 2) + Math.pow(shape.height, 2),
    );
    ctx.arc(shape.x, shape.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else if (shape.type === "arrow") {
    drawArrow(
      ctx,
      shape.x,
      shape.y,
      shape.x + shape.width,
      shape.y + shape.height,
    );
  }
};

const drawArrow = (
  ctx: CanvasRenderingContext2D,
  fromx: number,
  fromy: number,
  tox: number,
  toy: number,
) => {
  const headlen = 15;
  const angle = Math.atan2(toy - fromy, tox - fromx);
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.lineTo(
    tox - headlen * Math.cos(angle - Math.PI / 6),
    toy - headlen * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(tox, toy);
  ctx.lineTo(
    tox - headlen * Math.cos(angle + Math.PI / 6),
    toy - headlen * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
};

const startDrawing = (e: MouseEvent) => {
  if (!backgroundImage.value) {
    message.warning("请先上传图片");
    return;
  }
  isDrawing.value = true;
  const rect = canvasRef.value!.getBoundingClientRect();
  startPos.x = e.clientX - rect.left;
  startPos.y = e.clientY - rect.top;
};

const draw = (e: MouseEvent) => {
  if (!isDrawing.value) return;
  const rect = canvasRef.value!.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  render(); // Clear and redraw
  const ctx = canvasRef.value!.getContext("2d")!;
  drawShape(ctx, {
    type: tool.value,
    color: color.value,
    x: startPos.x,
    y: startPos.y,
    width: x - startPos.x,
    height: y - startPos.y,
  });
};

const stopDrawing = (e: MouseEvent) => {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  const rect = canvasRef.value!.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  shapes.value.push({
    type: tool.value,
    color: color.value,
    x: startPos.x,
    y: startPos.y,
    width: x - startPos.x,
    height: y - startPos.y,
  });
  render();
};

const exportImage = () => {
  if (!canvasRef.value) return;
  const link = document.createElement("a");
  link.download = "annotated-image.png";
  link.href = canvasRef.value.toDataURL();
  link.click();
};

const exportJSON = () => {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(shapes.value));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", "annotations.json");
  link.click();
};

const clearCanvas = () => {
  shapes.value = [];
  render();
};

onMounted(() => {
  window.addEventListener("resize", resizeCanvas);
});
</script>

<style scoped lang="less">
.annotate-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;

  .toolbar {
    margin-bottom: 20px;
    padding: 12px;
    background: #fafafa;
    border-radius: 4px;
  }

  .canvas-wrapper {
    width: 100%;
    overflow: auto;
    border: 1px solid #f0f0f0;
    cursor: crosshair;

    canvas {
      display: block;
      margin: 0 auto;
    }
  }
}
</style>
