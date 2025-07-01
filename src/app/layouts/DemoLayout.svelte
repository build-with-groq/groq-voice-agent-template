<script lang="ts">
  import * as Tabs from "@shared/components/ui/tabs";
  
  // Props
  export let configDetails: {label: string, value: string}[] = [];
  export let title: string = "Demo";
</script>

<div class="bg-white p-6">
  <h2 class="text-lg font-semibold mb-4">{title}</h2>
  <p class="text-sm text-gray-500 mb-4 max-w-screen-md">Experience natural voice conversations with AI powered by Groq's lightning-fast inference. Simply click the play button to start talking, and watch the real-time processing pipeline visualize your speech-to-text, AI reasoning, and text-to-speech generation. Get sub-second responses that feel like talking to a human.</p>
  
  <Tabs.Root value="diagram" class="w-full">
    <Tabs.Content value="diagram">
      <div class="rounded-lg shadow-sm mb-6 relative">
        <slot name="diagram"></slot>
      </div>
      
      <!-- Configuration Details (only in diagram tab) -->
      {#if configDetails.length > 0}
        <div class="text-sm text-gray-500 border-t border-gray-200 pt-4 mt-4">
          <p class="mb-2">Configuration Details:</p>
          <ul class="list-disc list-inside space-y-1">
            {#each configDetails as detail}
              <li>{detail.label}: {detail.value}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </Tabs.Content>
  </Tabs.Root>
  
  <!-- Error display -->
  <slot name="error"></slot>
  
  <!-- Custom content -->
  <slot></slot>
</div> 