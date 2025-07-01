<script lang="ts">
  import AppContent from "./AppContent.svelte";
</script>

<div class="h-screen flex flex-col bg-white overflow-hidden">
  <!-- Main content area below title bar -->
  <main class="main-content">
    <div class="flex h-full w-full">
      <div class="flex-1 flex flex-col bg-white">
        <!-- Main content with white background -->
        <div class="content-container flex-1 overflow-hidden py-2">
          <AppContent />
        </div>
      </div>
    </div>
  </main>
</div>

<style>
  :global(html, body, #app) {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);

    overflow: hidden;
    position: relative; /* Create a new stacking context */
    z-index: 1; /* Lower z-index than title bar */
  }
</style>
