<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { apiKeyStore } from '../stores/apiKeyStore';
  import { Button } from './ui/button';
  import { Input } from './ui/input';
  import { Label } from './ui/label';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

  export let isOpen = false;
  export let initialKey: string = '';
  
  const dispatch = createEventDispatcher<{
    close: void;
    keySet: void;
  }>();

  let apiKey = '';
  let error = '';
  let isSubmitting = false;

  // Clear or prefill inputs when modal opens
  $: if (isOpen) {
    apiKey = initialKey || '';
    error = '';
    isSubmitting = false;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!apiKey.trim()) {
      error = 'Please enter an API key';
      return;
    }

    isSubmitting = true;
    error = '';

    try {
      const result = apiKeyStore.setApiKey(apiKey.trim());
      
      if (result.success) {
        dispatch('keySet');
        dispatch('close');
      } else {
        error = result.error || 'Invalid API key';
      }
    } catch (e) {
      error = 'Failed to set API key';
      console.error('API key error:', e);
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    handleCancel();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Modal backdrop -->
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <!-- Modal content -->
    <div on:click|stopPropagation={() => {}}>
      <Card class="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle id="modal-title">Enter API Key</CardTitle>
          <CardDescription>
            Please enter your Groq API key to continue. Your key will only be stored in memory for this session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form on:submit={handleSubmit} class="space-y-4">
            <div class="space-y-2">
              <Label for="api-key">Groq API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="gsk_..."
                bind:value={apiKey}
                disabled={isSubmitting}
                class="font-mono"
                autocomplete="off"
                autofocus
              />
              {#if error}
                <p class="text-sm text-red-600" role="alert">
                  {error}
                </p>
              {/if}
            </div>
            
            <div class="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onclick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !apiKey.trim()}
              >
                {isSubmitting ? 'Setting...' : 'Set API Key'}
              </Button>
            </div>
          </form>
          
          <div class="mt-4 pt-4 border-t text-xs text-gray-500">
            <p>
              <strong>Note:</strong> Your API key is stored only in memory and will be lost when you refresh or close the browser.
            </p>
            <p class="mt-1">
              Get your API key from: <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">https://console.groq.com/keys</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
{/if} 