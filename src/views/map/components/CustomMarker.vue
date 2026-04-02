<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { CustomMarker } from 'vue3-google-map'

interface Props {
  closeEyes: boolean
  center: any
}

const props = defineProps<Props>()
</script>

<template>
  <CustomMarker :options="{ position: center }">
    <svg width="40" height="45" viewBox="0 0 60 65" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_17145_445)">
        <path
          d="M17.2427 43.555L17.2471 43.5595C19.3403 45.673 21.6351 47.5768 24.0988 49.2438L24.1049 49.2479L24.9933 49.8394L24.9932 49.8394L25.0019 49.8451L25.4179 50.1159L25.4286 50.1228L25.4394 50.1295L26.5661 50.8228L26.5766 50.8293L26.5873 50.8356L27.4887 51.3599L27.4886 51.3599L27.4958 51.364C28.2586 51.7994 29.1217 52.0284 30 52.0284C30.8783 52.0284 31.7414 51.7994 32.5042 51.364L32.5042 51.364L32.5113 51.3599L33.4127 50.8356L33.4217 50.8303L33.4307 50.8248L34.1587 50.3807L34.1668 50.3757L34.1749 50.3706L34.9917 49.8506L35.0001 49.8452L35.0084 49.8397L35.4417 49.5515L35.4418 49.5516L35.4507 49.5455L36.3737 48.9172L36.3738 48.9172L36.381 48.9122C38.6652 47.3276 40.7983 45.5356 42.7533 43.5591L42.7571 43.5552C46.6665 39.5595 50.5 33.8696 50.5 26.8333C50.5 21.3964 48.3402 16.1821 44.4957 12.3377C40.6512 8.49316 35.4369 6.33334 30 6.33334C24.5631 6.33334 19.3488 8.49316 15.5043 12.3377C11.6598 16.1821 9.5 21.3964 9.5 26.8333C9.5 33.8697 13.3336 39.5574 17.2427 43.555Z"
          fill="#044CA2"
          stroke="white"
          stroke-width="2"
        />
      </g>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M23.1434 23L32.3837 32.7278L30.7551 34.4423L19.8861 23H23.1434ZM28.0295 23L34.8267 30.1557L33.1981 31.8703L24.7721 23H28.0295ZM18.2574 23L29.656 35H28.5425C27.1174 35 25.8906 34.465 24.8829 33.4042L15 23H18.2574Z"
        fill="white"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M32.3314 25.8091C34.6819 25.8091 37.589 25.8091 40.062 25.8091C42.105 25.8091 43.2532 26.9708 43.5989 27.3341L45 28.8089C44.2084 28.8089 43.4168 28.8091 42.6254 28.8091L38.2607 33.4043C37.2534 34.4649 36.026 35 34.6012 35H31.8588C33.8188 32.9363 35.7791 30.8728 37.7391 28.809L36.6047 28.8089C35.8424 28.8089 34.9729 28.5914 34.0422 27.6112L32.3314 25.8091Z"
        fill="white"
      />
      <defs>
        <filter
          id="filter0_d_17145_445"
          x="0.5"
          y="0.333344"
          width="59"
          height="63.695"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.0666667 0 0 0 0 0.0941176 0 0 0 0 0.152941 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_17145_445" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_17145_445" result="shape" />
        </filter>
      </defs>
    </svg>
  </CustomMarker>
</template>

<style lang="scss" scoped>
.error-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &-svg {
    width: 400px;
    margin-bottom: 50px;
  }
}
</style>
