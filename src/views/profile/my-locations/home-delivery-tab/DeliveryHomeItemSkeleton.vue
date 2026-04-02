<template>
  <div class="pvz-card-skeleton">
    <el-skeleton animated>
      <template #template>
        <div class="skeleton-content">
          <el-skeleton-item variant="text" class="status-skeleton" />

          <div class="text-lines">
            <el-skeleton-item variant="h3" style="width: 80%" />
            <el-skeleton-item variant="text" style="width: 50%; margin-top: 10px" />
          </div>

          <el-skeleton-item variant="circle" class="icon-skeleton" />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style lang="scss" scoped>
.pvz-card-skeleton {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  width: 100%;
  height: 80px; // Asosiy kartangiz balandligiga moslang
  background: #fff;

  .skeleton-content {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .status-skeleton {
    width: 60px;
    height: 20px;
    border-radius: 32px;
    display: none; // Desktopda yashirin
  }

  .icon-skeleton {
    position: absolute;
    right: 0;
    top: 0;
    width: 20px;
    height: 20px;
  }
}

@media only screen and (max-width: 770px) {
  .pvz-card-skeleton {
    border-radius: 24px;
    height: 100px;

    .status-skeleton {
      display: block; // Mobileda ko'rinadi
    }
  }
}
</style>
