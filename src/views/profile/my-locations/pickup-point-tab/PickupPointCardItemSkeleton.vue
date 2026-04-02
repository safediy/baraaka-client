<template>
  <div class="w-full! border-solid border-[#e5e7eb] rounded-[16px] p-5 flex items-start justify-between gap-4 bg-white">
    <div class="flex flex-col gap-2 max-w-[480px] w-full md:max-w-full">
      <el-skeleton animated>
        <template #template>
          <div class="flex items-center justify-between gap-2">
            <el-skeleton-item variant="rect" class="w-[40px] h-[40px] rounded-[32px] mb-2" />
            <el-skeleton-item variant="rect" class="w-[40px] h-[40px] rounded-[32px] mb-2" />
          </div>
          <el-skeleton-item variant="text" class="w-[120px] h-[14px] mb-1" />

          <el-skeleton-item variant="text" class="w-full h-[14px]" />
          <el-skeleton-item variant="text" class="w-[80%] h-[14px] mt-1" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-skeleton) {
  --el-skeleton-color: #f2f2f2;
  --el-skeleton-to-color: #e6e6e6;
}
</style>
