const { createApp, ref, computed, watch } = Vue;

createApp({
  setup() {
    const title = ref('Prateleira de Podcasts');
    const podcasts = ref(podcastsData);
    const searchTerm = ref('');
    const categoryFilter = ref('');
    const languageFilter = ref('');
    const countryFilter = ref('');
    const isFabActive = ref(false);
    const showingAddPodcast = ref(false);
    const showingNewsletter = ref(false);

    // Computed properties para filtros
    const categories = computed(() => {
      return [...new Set(podcasts.value.map(p => p.category))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    });

    const languages = computed(() => {
      return [...new Set(podcasts.value.map(p => p.language))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    });

    const countries = computed(() => {
      const uniqueCountries = new Map()
      podcasts.value.forEach(p => {
        if (!uniqueCountries.has(p.country)) {
          uniqueCountries.set(p.country, {
            name: p.country,
            flag: p.flag
          })
        }
      })
      return Array.from(uniqueCountries.values())
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    });

    const totalPodcasts = computed(() => {
      return podcasts.value.length
    });

    const totalBrazilianPodcasts = computed(() => {
      return podcasts.value.filter(p => p.country === "Brasil").length
    });

    // Função para normalizar texto (remover acentos e converter ç)
    function normalizeText(text) {
      return text.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[çÇ]/g, 'c') // Converte ç para c
        .toLowerCase();
    }

    const filteredPodcasts = computed(() => {
      return podcasts.value.filter(podcast => {
        const searchNormalized = normalizeText(searchTerm.value);
        const nameNormalized = normalizeText(podcast.name);
        const descriptionNormalized = normalizeText(podcast.description);

        const matchesSearch = searchTerm.value === '' || 
          nameNormalized.includes(searchNormalized) ||
          descriptionNormalized.includes(searchNormalized);

        const matchesCategory = !categoryFilter.value || podcast.category === categoryFilter.value;
        const matchesLanguage = !languageFilter.value || podcast.language === languageFilter.value;
        const matchesCountry = !countryFilter.value || podcast.country === countryFilter.value;

        return matchesSearch && matchesCategory && matchesLanguage && matchesCountry;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); // Ordena alfabeticamente usando regras do português
    });

    const selectedCountryFlag = computed(() => {
      if (!countryFilter.value) return '🌎';
      const country = countries.value.find(c => c.name === countryFilter.value);
      return country ? country.flag : '🌎';
    });

    // Watcher para atualizar o texto do select quando o país é alterado
    watch(countryFilter, (newValue) => {
      const select = document.querySelector('select[v-model="countryFilter"]');
      if (select) {
        const flag = selectedCountryFlag.value;
        select.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><text x="0" y="20">${flag}</text></svg>')`;
        select.style.backgroundPosition = '12px center';
        select.style.backgroundRepeat = 'no-repeat';
        select.style.paddingLeft = newValue ? '40px' : '12px';
      }
    });

    function toggleFab() {
      isFabActive.value = !isFabActive.value
    }

    function showAddPodcastModal() {
      showingAddPodcast.value = true
      isFabActive.value = false
    }

    function showNewsletterModal() {
      showingNewsletter.value = true
      isFabActive.value = false
    }

    return {
      title,
      searchTerm,
      categoryFilter,
      languageFilter,
      countryFilter,
      podcasts,
      isFabActive,
      showingAddPodcast,
      showingNewsletter,
      categories,
      languages,
      countries,
      totalPodcasts,
      totalBrazilianPodcasts,
      filteredPodcasts,
      selectedCountryFlag,
      toggleFab,
      showAddPodcastModal,
      showNewsletterModal
    };
  }
}).mount('#app');
