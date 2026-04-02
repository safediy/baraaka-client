<script setup lang="ts">
import { ref } from 'vue'
import NoImg from '@/assets/noImg.png'
import VueEasyLightbox from 'vue-easy-lightbox'

const dialogVisible = ref(false)
const selectedIndex = ref(0)
const images = ref<string[]>([])
const isImageLoaded = ref<boolean[]>([])
const imageVisible = ref(false)

function show(imgList: string[], index = 0) {
  console.log('show', imgList, index)
  images.value = imgList
  selectedIndex.value = index
  isImageLoaded.value = new Array(imgList.length).fill(false)
  dialogVisible.value = true
  imageVisible.value = true
}

function handleImageLoad(index: number) {
  isImageLoaded.value[index] = true
}
function handleImageError(index: number) {
  images.value[index] = NoImg
  isImageLoaded.value[index] = true
}
function handleClose() {
  imageVisible.value = false
  dialogVisible.value = false
}
defineExpose({ show })
</script>

<template>
  <section v-if="dialogVisible" class="product-preview-dialog-wrapper">
    <el-dialog v-model="dialogVisible" fullscreen custom-class="product-preview-dialog" :show-close="false">
      <div class="preview-container">
        <div class="preview-navbar">
          <!-- <el-icon class="close-dialog-btn" @click="dialogVisible = false">
            <Close />
          </el-icon> -->
          <el-text class="preview-content-title relative z-200" tag="p">Fotosuratlar</el-text>
        </div>
        <!-- Main Image -->
        <div class="main-image relative z-100">
          <div v-if="!isImageLoaded[selectedIndex]" class="image-skeleton" />
          <!-- <el-image fit="contain" class="img" v-show="isImageLoaded[selectedIndex]" :src="images[selectedIndex]"
            alt="product" :draggable="true" @load="handleImageLoad(selectedIndex)"
            @error="handleImageError(selectedIndex)" :preview-src-list="images" /> -->

          <VueEasyLightbox
            :visible="imageVisible"
            :imgs="images"
            :index="selectedIndex"
            :zoomScale="1"
            @hide="handleClose"
          />
        </div>

        <!-- Thumbnail Selector -->
        <div class="thumbnail-carousel relative z-200 bottom-10">
          <div
            v-for="(img, index) in images"
            :key="index"
            class="thumbnail"
            :class="{ active: selectedIndex === index }"
            @click="selectedIndex = index"
          >
            <div v-if="!isImageLoaded[index]" class="thumb-skeleton" />
            <img
              v-show="isImageLoaded[index]"
              :src="img"
              @load="handleImageLoad(index)"
              @error="handleImageError(index)"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </section>
</template>

<style lang="scss">
.product-preview-dialog {
  padding: 0;
  background-color: #000 !important;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.preview-navbar {
  width: 100%;
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 56px;
  border-bottom: 1px solid #111827;
}

.preview-content-title {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
}

.preview-navbar-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: green;
}

.close-dialog-btn {
  position: absolute;
  left: 10px;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  z-index: 1000;
}

.product-preview-dialog-wrapper .el-overlay-dialog {
  margin: 0 !important;
}

.preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 45px;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  justify-content: space-between;
}

.main-image {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60vh;
  margin-top: 26px;
  padding: 0 16px;
  background-color: black;

  .img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .image-skeleton {
    width: 100%;
    max-width: 900px;
    height: 500px;
    background: linear-gradient(90deg, #2c2c2c 25%, #3a3a3a 50%, #2c2c2c 75%);
    background-size: 400% 100%;
    animation: skeleton-loading 1.2s ease-in-out infinite;
    border-radius: 16px;
  }
}

.thumbnail-carousel {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 12px;
  width: 90%;
  margin: 0 auto;
  justify-content: center;

  .thumbnail {
    border-radius: 16px;
    overflow: hidden;
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    cursor: pointer;

    &.active {
      border: 2px solid #fff;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;

      &.active {
        border: 2px solid #000;
      }
    }

    .thumb-skeleton {
      width: 100%;
      height: 100%;
      border-radius: 16px;
      background: linear-gradient(90deg, #2c2c2c 25%, #3a3a3a 50%, #2c2c2c 75%);
      background-size: 400% 100%;
      animation: skeleton-loading 1.2s ease-in-out infinite;
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}
</style>
