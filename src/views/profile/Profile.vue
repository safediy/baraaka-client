<script setup lang="ts">
import { ref } from 'vue'
import '../auth/index.css'
import { useI18n } from 'vue-i18n'
import LogoutDialog from './LogoutDialog.vue'
import RatingIcon from '@/assets/profile/rating.png'
import { useUserStore } from '@/store/modules/user'
import MyLocationsDialog from './my-locations/MyLocationsDialog.vue'
import LocationIcon from '@/assets/profile/location.png'
import PersonalDetailsDialog from './PersonalDetailsDialog.vue'
import HouseSvg from '@/assets/svg/house.svg'
import RatingSvg from '@/assets/svg/rating.svg'
import UserSvg from '@/assets/svg/user.svg'
import LanguageSvg from '@/assets/svg/language.svg'
import HelpSvg from '@/assets/svg/help.svg'
import LogoutSvg from '@/assets/svg/logout.svg'
import MyRatingDialog from './MyRatingDialog.vue'
import LanguageDialog from './LanguageDialog.vue'

const { t } = useI18n()
const logoutDialog = ref()
const myLocationsDialog = ref()
const myRatingDialog = ref()
const userStore = useUserStore()
const personalDetailsDialog = ref()
const languageDialog = ref()

const handleViewMyLocations = () => {
  myLocationsDialog?.value.show()
}

const handleViewPersonalDetails = () => {
  personalDetailsDialog?.value.show()
}

const handleLogout = () => {
  logoutDialog.value.view()
}

const handleViewRating = () => {
  myRatingDialog.value.view()
}
const handleViewLanguageDialog = () => {
  languageDialog.value.view()
}
</script>

<template>
  <section class="w-full bg-white h-full flex items-center flex-col justify-between max-md:pt-0">
    <section class="client-container">
      <div class="content-container content-container-wrapper">
        <div class="text-center mt-[30px]">
          <el-text class="text-[18px] font-semibold uno-text-main leading-[28px] mb-0.5" tag="p">{{
            userStore?.username ? userStore?.username : userStore?.phone
          }}</el-text>
          <el-text class="text-[14px] font-medium text-[#9CA3AF]" tag="span">+998{{ userStore.phone }}</el-text>
        </div>
        <div class="w-full flex items-start justify-between gap-2 mt-10">
          <div
            @click="handleViewMyLocations"
            class="p-3 bg-[#f3f4f6] w-full h-[120px] rounded-[20px] relative overflow-hidden cursor-pointer max-md:flex max-md:flex-col max-md:items-start max-md:justify-between max-md:h-[140px]"
          >
            <img :src="HouseSvg" class="hidden w-11 h-11 object-contain max-md:block" />
            <el-text class="text-[14px] font-medium uno-text-main max-md:leading-[120%] max-md:w-[90%]" tag="h4">{{
              t('myAddress')
            }}</el-text>
            <img class="w-[70px] h-[70px] object-contain absolute right-0 bottom-0 max-md:hidden" :src="LocationIcon" />
          </div>
          <div
            @click="handleViewRating"
            class="p-3 bg-[#f3f4f6] w-full h-[120px] rounded-[20px] relative overflow-hidden cursor-pointer max-md:flex max-md:flex-col max-md:items-start max-md:justify-between max-md:h-[140px]"
          >
            <img :src="RatingSvg" class="hidden w-11 h-11 object-contain max-md:block" />
            <el-text class="text-[14px] font-medium uno-text-main max-md:leading-[120%] max-md:w-[90%]" tag="h4">{{
              t('myIndicators')
            }}</el-text>
            <img class="w-[70px] h-[70px] object-contain absolute right-0 bottom-0 max-md:hidden" :src="RatingIcon" />
          </div>
        </div>

        <div class="w-full mt-6 max-md:mt-5">
          <div
            @click="handleViewPersonalDetails"
            class="detail-item w-full flex items-center justify-between py-5 px-2.5 border-b-solid border-[#f3f4f6] hover:rounded-[12px] hover:bg-[#f3f4f6c5] hover:cursor-pointer"
          >
            <div class="detail flex items-center gap-4">
              <img :src="UserSvg" alt="user" class="w-6 h-6" />
              <el-text class="detail-text" tag="p">{{ t('personalDetails') }}</el-text>
            </div>
            <el-icon>
              <ArrowRight />
            </el-icon>
          </div>
          <div @click="handleViewLanguageDialog" class="detail-item language-item">
            <div class="detail">
              <img :src="LanguageSvg" />
              <el-text class="detail-text" tag="p">{{ t('languageSelect') }}</el-text>
            </div>
            <el-icon>
              <ArrowRight />
            </el-icon>
          </div>
          <a :href="`https://t.me/iPost_help_bot`" target="_blank" class="detail-item">
            <div class="detail">
              <img :src="HelpSvg" />
              <el-text class="detail-text" tag="p">{{ t('help') }}</el-text>
            </div>
            <el-icon>
              <ArrowRight />
            </el-icon>
          </a>
          <div @click="handleLogout" class="detail-item logout-item">
            <div class="detail">
              <img :src="LogoutSvg" />
              <el-text class="detail-text" tag="p">{{ t('logout') }}</el-text>
            </div>
            <el-icon class="right-icon">
              <ArrowRight />
            </el-icon>
          </div>
        </div>
        <div class="copyright-contents">
          <el-text tag="span">Talqin: 1.4.7</el-text>
          <el-text tag="span">© 2026 iPost</el-text>
        </div>
      </div>
    </section>
  </section>
  <MyLocationsDialog ref="myLocationsDialog" />
  <LanguageDialog ref="languageDialog" />
  <PersonalDetailsDialog ref="personalDetailsDialog" />
  <LogoutDialog ref="logoutDialog" />
  <MyRatingDialog ref="myRatingDialog" />
  <PromoCodeDialog />
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.detail-item {
  width: 100%;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 20px 10px;
  border-bottom: 1px solid #f3f4f6;

  &:hover {
    border-radius: 12px;
    background-color: #f3f4f6c5;
    cursor: pointer;
  }

  .detail {
    display: flex;
    align-items: center;
    gap: 15px;

    img {
      width: 24px;
      height: 24px;
    }

    .icon {
      @include f-style(20px, 500, #6b7280);
    }

    .detail-text {
      @include f-style(15px, 500, #111827);
    }
  }
}

.copyright-contents {
  display: none;
  justify-content: space-between;
  flex-direction: column;
  max-width: 150px;
  align-items: center;
  margin: 20px auto 0;
  gap: 4px;

  span {
    @include f-style(13px, 500, #9ca3af);
  }
}

.profile-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.language-item {
  display: none !important;
}

.logout-item {
  .icon,
  .detail-text,
  .right-icon {
    color: #d81b51 !important;
  }
}

@media only screen and (max-width: 770px) {
  .content-container-wrapper {
    max-width: 100%;
    padding: 0;
  }

  .copyright-contents {
    display: flex;
  }

  .profile-footer {
    display: none;
  }

  .detail-item {
    padding: 20px 10px;

    &:last-child {
      border-bottom: none;
    }

    .detail {
      gap: 12px;

      .detail-text {
        @include f-style(14px, 500, #111827);
      }
    }
  }

  .language-item {
    display: flex !important;
  }
}
</style>
