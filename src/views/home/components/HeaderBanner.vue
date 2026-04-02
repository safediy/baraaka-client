<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AddImage from '@/assets/banner/add.png'
// import Manual from '@/assets/banner/manual.png'
import Location from '@/assets/banner/location.png'
import CarouselImage1 from '@/assets/banner/carousel1.png'
import CarouselImage2 from '@/assets/banner/carousel2.png'
import CarouselImage3 from '@/assets/banner/carousel3.png'
import WebCarouselImage1 from '@/assets/banner/webCarousel1.png'
import WebCarouselImage2 from '@/assets/banner/webCarousel2.png'
import WebCarouselImage3 from '@/assets/banner/webCarousel3.png'
import Warehouse from '@/assets/banner/warehouse.png'
import CalculatorImg from '@/assets/banner/calculator.png'

import PlusSvg from '@/assets/svg/plus.svg'
// import ManualSvg from '@/assets/svg/manual.svg'
import LocationSvg from '@/assets/svg/location.svg'
import PickUpPointSvg from '@/assets/svg/location.svg'
import CalculatorSvg from '@/assets/svg/calculator.svg'

import ChinaLocationDialog from './ChinaLocationDialog.vue'
import AddTrackNumberDialog from '@/layouts/components/Navbar/AddTrackNumberDialog.vue'
import { useRouter } from 'vue-router'
import CalculatorDialog from './CalculatorDialog.vue'

const { t } = useI18n()
const router = useRouter()

const chinaLocationDialog = ref()
const addTrackNumberDialog = ref()
const calculatorDialog = ref()

const handleAddTrackNumber = () => {
  addTrackNumberDialog.value.show()
}
const handleViewLocation = () => {
  chinaLocationDialog.value.show()
}
const handleOpenCalculator = () => {
  calculatorDialog.value.view()
}
const isMobile = ref(window.innerWidth <= 770)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 770
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Reactive banner array
const Banners = computed(() => {
  return isMobile.value
    ? [CarouselImage1, CarouselImage2, CarouselImage3]
    : [WebCarouselImage1, WebCarouselImage2, WebCarouselImage3]
})
</script>
<template>
  <section style="margin-top: 24px">
    <div class="carousel-wrapper">
      <el-carousel :interval="4000" arrow="never" autoplay class="header-carousel">
        <el-carousel-item class="carousel-item" v-for="(image, index) in Banners" :key="index">
          <img style="width: 100%" class="carousel-image" :src="image" alt="Banner image" />
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="banner__image-cards">
      <div @click="handleAddTrackNumber" class="image-card">
        <img class="media-img" :src="PlusSvg" />
        <el-text class="image-card__title" tag="h4">{{ t('addTrackNumber') }}</el-text>
        <div class="card-img">
          <img :src="AddImage" />
        </div>
      </div>
      <div @click="handleViewLocation" class="image-card">
        <img class="media-img" :src="LocationSvg" />
        <el-text class="image-card__title" tag="h4">{{ t('ourLocationInChina') }}</el-text>
        <div class="card-img">
          <img :src="Warehouse" />
        </div>
      </div>
      <div @click="router.push({ name: 'PickupPoints' })" class="image-card">
        <img class="media-img" :src="PickUpPointSvg" />
        <el-text class="image-card__title" tag="h4">{{ t('deliveryPoints') }}</el-text>
        <div class="card-img">
          <img :src="Location" />
        </div>
      </div>
      <!-- <div class="image-card">
        <img class="media-img" :src="ManualSvg" />
        <el-text class="image-card__title" tag="h4">{{ t('manuals') }}</el-text>
        <div class="card-img">
          <img :src="Manual" />
        </div>
      </div> -->
      <!-- <div @click="handleOpenCalculator" class="image-card">
        <img class="media-img" :src="CalculatorSvg" />
        <el-text class="image-card__title" tag="h4">{{ t('cargoCalculator') }}</el-text>
        <div class="card-img">
          <img :src="CalculatorImg" />
        </div>
      </div> -->
    </div>
  </section>
  <AddTrackNumberDialog ref="addTrackNumberDialog" />
  <ChinaLocationDialog ref="chinaLocationDialog" />
  <CalculatorDialog ref="calculatorDialog" />
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.header-carousel {
  height: 180px;
}

.el-carousel__item {
  height: 180px;
}

:deep(.el-carousel__container) {
  height: 180px !important;
}

.carousel-item {
  border-radius: 24px;
}

:deep(.el-carousel__indicators) {
  bottom: -4%;
}

.carousel-overlay-content {
  position: absolute;
  top: 0;
  left: 0%;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  background-color: #00030b25;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  display: none;

  .content-text {
    margin-top: 6rem;
    text-align: center;
    max-width: 260px;
    line-height: 120%;
    @include f-style(13px, 500, #7e858f);
  }
}

:deep(.el-carousel__indicators .el-carousel__button) {
  padding: 4px !important;
  border-radius: 50% !important;
  width: 7px;
}

:deep(.dialog-drawer.el-drawer.btt.open) {
  height: fit-content !important;
}

.carousel-image {
  height: 180px;
  width: 100%;
  object-fit: cover;
  border-radius: 24px !important;
  padding: 0 4px;
}

.banner__image-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-items: center;
  gap: 8px;
  margin-top: 24px;

  .image-card {
    width: 100%;
    max-width: 300px;
    height: 110px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    // padding: 12px;
    padding: 12px 0 0 12px;
    border-radius: 20px;
    background-color: #f3f4f6;
    cursor: pointer;
    transition: ease-in-out 0.2s;
    overflow: hidden;

    &:hover {
      background-color: #efefef;
    }

    .media-img {
      display: none;
      width: 44px;
      height: 44px;
      object-fit: contain;
    }

    .image-card__title {
      @include f-style(14px, 500, #111827);
      line-height: 20px;
      width: 100%;
    }

    .card-img {
      width: 100%;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
}

.el-close-button {
  width: 100%;
  background-color: #030712;
  border-radius: 16px;
  height: 48px;
  @include f-style(15px, 500, #fff);
  margin-top: 24px;
}

@media only screen and (max-width: 770px) {
  :deep(.el-carousel__indicators .el-carousel__button) {
    display: none;
  }

  :deep(.el-carousel--horizontal) {
    overflow: unset !important;
  }

  .banner__image-cards {
    grid-template-columns: repeat(2, 1fr);
    margin-top: 10px;

    .image-card {
      text-align: left;
      max-width: 100%;
      height: 140px;
      padding: 12px;
      border-radius: 24px;

      .media-img {
        display: block;
      }

      .image-card__title {
        margin-top: 25px;
        line-height: 17px;
        font-weight: 600;
      }

      .card-img {
        display: none;
      }
    }
  }
}

@media only screen and (max-width: 480px) {
  .header-carousel,
  .el-carousel__item,
  .carousel-image {
    height: 160px;
  }
}
</style>
