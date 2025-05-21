export default function PromptGenerator() {
  const container = document.createElement('div');
  container.className = 'prompt-generator';
  
  container.innerHTML = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">Generator Prompt Text-to-Image</h1>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="keywords">
            Masukkan Kata Kunci
          </label>
          <input 
            type="text" 
            id="keywords"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Contoh: sunset beach tropical paradise"
          >
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="promptCount">
            Jumlah Prompt
          </label>
          <select 
            id="promptCount"
            class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="1">1 Prompt</option>
            <option value="3">3 Prompt</option>
            <option value="5">5 Prompt</option>
            <option value="10">10 Prompt</option>
            <option value="20">20 Prompt</option>
            <option value="50">50 Prompt</option>
            <option value="100">100 Prompt</option>
          </select>
        </div>
        
        <button 
          id="generateBtn"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Generate Prompt
        </button>
        
        <div class="mt-6">
          <div class="flex justify-end items-center mb-2">
            <button 
              id="downloadAllBtn"
              class="bg-green-500 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hidden"
            >
              Download Semua Prompt
            </button>
          </div>
          <div id="promptsContainer">
            <!-- Prompts will be inserted here -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Event Handlers
  setTimeout(() => {
    const generateBtn = container.querySelector('#generateBtn');
    const downloadAllBtn = container.querySelector('#downloadAllBtn');
    const keywordsInput = container.querySelector('#keywords');
    const promptCount = container.querySelector('#promptCount');
    const promptsContainer = container.querySelector('#promptsContainer');

    // Fungsi untuk mendownload semua prompt tanpa nomor
    const downloadAllPrompts = (prompts) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `all-prompts-${timestamp}.txt`;
      
      // Gabungkan prompt dengan separator tanpa nomor
      const content = prompts.join('\n\n---\n\n');
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };

    const createPromptCard = (promptText) => {
      const card = document.createElement('div');
      card.className = 'bg-gray-100 p-4 rounded-lg mb-4';
      
      card.innerHTML = `
        <div class="flex justify-end items-start mb-2">
          <div class="flex gap-2">
            <button class="copy-btn text-sm bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded">
              Salin
            </button>
            <button class="download-btn text-sm bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded">
              Download
            </button>
          </div>
        </div>
        <div class="prompt-text whitespace-pre-wrap">${promptText}</div>
      `;

      const copyBtn = card.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(promptText)
          .then(() => {
            copyBtn.textContent = 'Tersalin!';
            setTimeout(() => copyBtn.textContent = 'Salin', 2000);
          })
          .catch(() => alert('Gagal menyalin prompt'));
      });

      const downloadBtn = card.querySelector('.download-btn');
      downloadBtn.addEventListener('click', () => {
        const blob = new Blob([promptText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });

      return card;
    };

    generateBtn.addEventListener('click', async () => {
      const keywords = keywordsInput.value.trim();
      
      if (!keywords) {
        alert('Mohon masukkan kata kunci!');
        return;
      }

      try {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        promptsContainer.innerHTML = '<div class="text-center">Sedang menghasilkan prompt...</div>';
        downloadAllBtn.classList.add('hidden');
        
        const response = await fetch('/generate-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            keywords,
            count: parseInt(promptCount.value)
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(`${data.error} ${data.detail || ''}`);
        }

        // Clear previous prompts
        promptsContainer.innerHTML = '';
        
        if (Array.isArray(data.prompts) && data.prompts.length > 0) {
          data.prompts.forEach((prompt) => {
            promptsContainer.appendChild(createPromptCard(prompt));
          });
          
          // Tampilkan tombol download semua jika ada lebih dari 1 prompt
          if (data.prompts.length > 1) {
            downloadAllBtn.classList.remove('hidden');
            downloadAllBtn.onclick = () => downloadAllPrompts(data.prompts);
          }
        } else {
          throw new Error('Tidak ada prompt yang dihasilkan');
        }

      } catch (error) {
        console.error('Error:', error);
        promptsContainer.innerHTML = `
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: ${error.message}
          </div>
        `;
        downloadAllBtn.classList.add('hidden');
      } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Prompt';
      }
    });
  }, 0);

  return container;
}
