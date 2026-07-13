"use strict";

(() => {
  const CONTENT_URL = "data/content.json";
  const DESKTOP_MEDIA_QUERY = window.matchMedia("(min-width: 64rem)");
  const REDUCED_MOTION_QUERY = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const getElement = (id) => document.getElementById(id);

  const setText = (id, value, fallback = "") => {
    const element = getElement(id);

    if (!element) {
      return;
    }

    element.textContent =
      typeof value === "string" && value.trim() ? value.trim() : fallback;
  };

  const getSafeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) {
      return null;
    }

    try {
      const url = new URL(value.trim(), document.baseURI);

      if (!["http:", "https:"].includes(url.protocol)) {
        return null;
      }

      return url.href;
    } catch {
      return null;
    }
  };

  const getSafeYouTubeId = (value) => {
    if (typeof value !== "string") {
      return null;
    }

    const videoId = value.trim();
    return /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null;
  };

  const configureLink = (element, url) => {
    if (!element) {
      return;
    }

    const safeUrl = getSafeUrl(url);

    if (!safeUrl) {
      element.hidden = true;
      element.removeAttribute("href");
      return;
    }

    element.href = safeUrl;
    element.hidden = false;
  };

  const configureFormLink = (element, url) => {
    if (!element) {
      return;
    }

    const safeUrl = getSafeUrl(url);

    if (safeUrl) {
      element.href = safeUrl;
      element.textContent = "Deixar minha mensagem";
      element.setAttribute("aria-disabled", "false");
      element.classList.remove("is-disabled");
      return;
    }

    element.removeAttribute("href");
    element.textContent = "Formulário em breve";
    element.setAttribute("aria-disabled", "true");
    element.classList.add("is-disabled");
  };

  const configureImage = (image, source, alternativeText) => {
    if (!image) {
      return false;
    }

    const safeSource = getSafeUrl(source);

    if (!safeSource) {
      image.remove();
      return false;
    }

    image.src = safeSource;
    image.alt =
      typeof alternativeText === "string" ? alternativeText.trim() : "";

    image.addEventListener(
      "error",
      () => {
        image.remove();
      },
      { once: true }
    );

    return true;
  };

  const updatePageMetadata = (evento = {}) => {
    const title = evento.titulo?.trim() || "1º Lual da Perseverança";
    const description =
      evento.subtitulo?.trim() ||
      "Reviva o Lual, conheça santos jovens e continue sua missão.";

    document.title = `${title} | Perseverança`;

    const titleMeta = document.querySelector('meta[property="og:title"]');
    const descriptionMeta = document.querySelector(
      'meta[name="description"]'
    );
    const openGraphDescription = document.querySelector(
      'meta[property="og:description"]'
    );

    if (titleMeta) {
      titleMeta.content = title;
    }

    if (descriptionMeta) {
      descriptionMeta.content = description;
    }

    if (openGraphDescription) {
      openGraphDescription.content = description;
    }
  };

  const renderEvent = (evento = {}) => {
    setText("evento-titulo-prefixo", evento.tituloPrefixo, "Lual da");
    setText(
      "evento-titulo-destaque",
      evento.tituloDestaque,
      "Perseverança"
    );
    setText("evento-edicao", evento.edicao, "1ª edição");
    setText(
      "evento-tema",
      evento.tema,
      "Santos Jovens: Luzes que brilham para Cristo"
    );
    setText(
      "evento-subtitulo",
      evento.subtitulo,
      "A santidade também é para os jovens."
    );
    setText("evento-data", evento.data, "08 de agosto de 2026");
    updatePageMetadata(evento);
  };

  const renderMessage = (mensagem = {}) => {
    setText(
      "mensagem-destaque",
      mensagem.destaque,
      "Tudo o que vivemos é um convite para continuarmos caminhando com Jesus."
    );
    setText(
      "mensagem-texto",
      mensagem.texto,
      "Que esta experiência permaneça viva em nosso cotidiano."
    );
  };

  const renderGallery = (galeria = {}) => {
    const mainFigure = getElement("galeria-destaque");
    const mainImage = getElement("galeria-imagem-principal");
    const mainCaption = getElement("galeria-legenda-principal");
    const thumbnails = getElement("galeria-miniaturas");
    const controls = getElement("galeria-controles");
    const emptyState = getElement("galeria-vazia");
    const template = getElement("modelo-miniatura-foto");

    setText(
      "galeria-descricao",
      galeria.descricao,
      "Uma foto em destaque e outros registros para deslizar para o lado."
    );
    configureLink(getElement("link-album"), galeria.linkAlbum);

    if (
      !mainFigure ||
      !mainImage ||
      !mainCaption ||
      !thumbnails ||
      !controls ||
      !emptyState ||
      !template
    ) {
      return;
    }

    const photos = (Array.isArray(galeria.fotos) ? galeria.fotos : [])
      .map((photo) => ({
        source: getSafeUrl(photo?.imagem),
        alternativeText:
          typeof photo?.textoAlternativo === "string"
            ? photo.textoAlternativo.trim()
            : "",
        caption:
          typeof photo?.legenda === "string" ? photo.legenda.trim() : ""
      }))
      .filter((photo) => photo.source);

    thumbnails.replaceChildren();

    if (photos.length === 0) {
      mainFigure.hidden = true;
      thumbnails.hidden = true;
      controls.hidden = true;
      emptyState.hidden = false;
      return;
    }

    const buttons = [];

    const selectPhoto = (index, moveFocus = false) => {
      const photo = photos[index];

      if (!photo) {
        return;
      }

      mainImage.src = photo.source;
      mainImage.alt = photo.alternativeText;
      mainCaption.textContent = photo.caption;
      mainCaption.hidden = !photo.caption;

      buttons.forEach((button, buttonIndex) => {
        const selected = buttonIndex === index;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));

        if (selected && moveFocus) {
          button.scrollIntoView({
            behavior: REDUCED_MOTION_QUERY.matches ? "auto" : "smooth",
            block: "nearest",
            inline: "center"
          });
        }
      });
    };

    const fragment = document.createDocumentFragment();

    photos.forEach((photo, index) => {
      const clone = template.content.cloneNode(true);
      const button = clone.querySelector(".gallery-thumbnail");
      const image = clone.querySelector(".gallery-thumbnail__image");
      const label = clone.querySelector(".gallery-thumbnail__label");

      if (!button || !image || !label) {
        return;
      }

      image.src = photo.source;
      image.alt = "";
      label.textContent = photo.caption || `Foto ${index + 1}`;
      button.setAttribute(
        "aria-label",
        `Exibir ${photo.caption || `foto ${index + 1}`}`
      );
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => selectPhoto(index));
      buttons.push(button);
      fragment.append(clone);
    });

    thumbnails.append(fragment);
    mainFigure.hidden = false;
    thumbnails.hidden = false;
    controls.hidden = photos.length < 2;
    emptyState.hidden = true;
    selectPhoto(0);
  };

  const renderSaints = (saints = []) => {
    const container = getElement("lista-santos");
    const template = getElement("modelo-santo");

    if (!container || !template) {
      return;
    }

    container.replaceChildren();

    if (!Array.isArray(saints) || saints.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state empty-state--light";
      emptyState.textContent =
        "As histórias dos santos serão adicionadas em breve.";
      container.append(emptyState);
      return;
    }

    const fragment = document.createDocumentFragment();

    saints.forEach((saint) => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector(".saint-card");
      const image = clone.querySelector(".saint-card__image");
      const name = clone.querySelector(".saint-card__name");
      const quote = clone.querySelector(".saint-card__quote");
      const summary = clone.querySelector(".saint-card__summary");
      const link = clone.querySelector(".saint-card__link");

      if (!card || !name || !quote || !summary) {
        return;
      }

      configureImage(
        image,
        saint.imagem,
        saint.textoAlternativo || `Representação de ${saint.nome || "santo"}`
      );

      name.textContent = saint.nome?.trim() || "Santo em destaque";
      quote.textContent = saint.frase?.trim()
        ? `“${saint.frase.trim()}”`
        : "";
      summary.textContent =
        saint.resumo?.trim() ||
        "Conheça um pouco mais sobre este testemunho de fé.";

      const safeLink = getSafeUrl(saint.link);

      if (link && safeLink) {
        link.href = safeLink;
      } else if (link) {
        link.remove();
      }

      fragment.append(clone);
    });

    container.append(fragment);
  };

  const renderVideos = (videos = {}) => {
    const experience = getElement("video-experience");
    const emptyState = getElement("videos-vazio");
    const list = getElement("lista-videos");
    const template = getElement("modelo-video");
    const player = getElement("youtube-player");

    setText(
      "videos-descricao",
      videos.descricao,
      "Escolha uma música e assista sem sair desta página."
    );

    if (!experience || !emptyState || !list || !template || !player) {
      return;
    }

    const items = (Array.isArray(videos.itens) ? videos.itens : [])
      .map((item) => ({
        videoId: getSafeYouTubeId(item?.youtubeId),
        title:
          typeof item?.titulo === "string" ? item.titulo.trim() : "",
        artist:
          typeof item?.artista === "string" ? item.artista.trim() : "",
        category:
          typeof item?.categoria === "string" ? item.categoria.trim() : "",
        description:
          typeof item?.descricao === "string" ? item.descricao.trim() : ""
      }))
      .filter((item) => item.videoId && item.title);

    list.replaceChildren();

    if (items.length === 0) {
      experience.hidden = true;
      emptyState.hidden = false;
      player.removeAttribute("src");
      return;
    }

    const buttons = [];

    const selectVideo = (index) => {
      const item = items[index];

      if (!item) {
        return;
      }

      player.src =
        `https://www.youtube-nocookie.com/embed/${item.videoId}` +
        "?rel=0&playsinline=1";
      player.title = `${item.title}, por ${item.artist || "artista convidado"}`;
      setText("video-categoria", item.category, "Música");
      setText("video-titulo", item.title, "Música do Lual");
      setText("video-artista", item.artist, "");
      setText(
        "video-descricao",
        item.description,
        "Uma música para continuar vivendo a experiência do Lual."
      );

      buttons.forEach((button, buttonIndex) => {
        const selected = buttonIndex === index;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    };

    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const clone = template.content.cloneNode(true);
      const button = clone.querySelector(".video-option");
      const image = clone.querySelector(".video-option__image");
      const category = clone.querySelector(".video-option__category");
      const title = clone.querySelector(".video-option__title");
      const artist = clone.querySelector(".video-option__artist");

      if (!button || !image || !category || !title || !artist) {
        return;
      }

      image.src = `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
      image.alt = "";
      category.textContent = item.category || "Música";
      title.textContent = item.title;
      artist.textContent = item.artist;
      button.setAttribute(
        "aria-label",
        `Selecionar ${item.title}${item.artist ? `, de ${item.artist}` : ""}`
      );
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => selectVideo(index));
      buttons.push(button);
      fragment.append(clone);
    });

    list.append(fragment);
    experience.hidden = false;
    emptyState.hidden = true;
    selectVideo(0);
  };

  const renderMural = (mural = {}) => {
    const container = getElement("lista-mensagens");
    const template = getElement("modelo-mensagem");

    setText(
      "mural-descricao",
      mural.descricao,
      "Deixe uma mensagem de fé, carinho, gratidão ou encorajamento."
    );
    configureFormLink(
      getElement("link-formulario-mural"),
      mural.linkFormulario
    );

    if (!container || !template) {
      return;
    }

    const messages = (Array.isArray(mural.mensagens)
      ? mural.mensagens
      : []
    ).filter((item) => {
      return (
        typeof item?.nome === "string" &&
        item.nome.trim() &&
        typeof item?.mensagem === "string" &&
        item.mensagem.trim()
      );
    });

    container.replaceChildren();

    if (messages.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state empty-state--light";
      emptyState.textContent =
        "As primeiras mensagens aprovadas aparecerão aqui.";
      container.append(emptyState);
      return;
    }

    const fragment = document.createDocumentFragment();

    messages.forEach((item, index) => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector(".mural-card");
      const message = clone.querySelector(".mural-card__message");
      const author = clone.querySelector(".mural-card__author");

      if (!card || !message || !author) {
        return;
      }

      if (index === 0) {
        card.classList.add("mural-card--featured");
      }

      message.textContent = `“${item.mensagem.trim()}”`;
      author.textContent = `— ${item.nome.trim()}`;
      fragment.append(clone);
    });

    container.append(fragment);
  };

  const renderMission = (mission = {}) => {
    setText("missao-nome", mission.nome, "Reserve um tempo para Jesus");
    setText(
      "missao-descricao",
      mission.descricao,
      "Separe alguns minutos do seu dia para conversar com Deus."
    );

    const phrase = mission.frase?.trim();

    setText(
      "missao-frase",
      phrase ? `“${phrase}”` : "",
      "“Permanecei em mim e eu permanecerei em vós.”"
    );
    setText("missao-referencia", mission.referencia, "João 15,4");
  };

  const renderNextMeeting = (meeting = {}) => {
    setText("proximo-encontro-dia", meeting.dia, "—");
    setText("proximo-encontro-mes", meeting.mes, "Em breve");
    setText("proximo-encontro-tema", meeting.tema, "Nova data em breve");
    setText(
      "proximo-encontro-horario",
      meeting.horario,
      "Acompanhe os avisos da Perseverança."
    );
    setText(
      "proximo-encontro-local",
      meeting.local,
      "Paróquia Santo Inácio de Loyola"
    );
  };

  const renderContent = (content) => {
    renderEvent(content.evento);
    renderMessage(content.mensagem);
    renderGallery(content.galeria);
    renderSaints(content.santos);
    renderVideos(content.videos);
    renderMission(content.missao);
    renderMural(content.mural);
    renderNextMeeting(content.proximoEncontro);
  };

  const showLoadingError = () => {
    const galleryEmpty = getElement("galeria-vazia");
    const galleryMain = getElement("galeria-destaque");
    const galleryList = getElement("galeria-miniaturas");
    const videoExperience = getElement("video-experience");
    const videosEmpty = getElement("videos-vazio");
    const saints = getElement("lista-santos");

    if (galleryMain) {
      galleryMain.hidden = true;
    }

    if (galleryList) {
      galleryList.hidden = true;
    }

    if (galleryEmpty) {
      galleryEmpty.hidden = false;
      galleryEmpty.textContent =
        "Não foi possível carregar as fotos neste momento.";
    }

    if (videoExperience) {
      videoExperience.hidden = true;
    }

    if (videosEmpty) {
      videosEmpty.hidden = false;
      videosEmpty.textContent =
        "Não foi possível carregar os vídeos neste momento.";
    }

    if (saints) {
      saints.replaceChildren();
      const message = document.createElement("p");
      message.className = "empty-state empty-state--light";
      message.textContent =
        "Não foi possível carregar as histórias dos santos.";
      saints.append(message);
    }
  };

  const loadContent = async () => {
    try {
      const response = await fetch(CONTENT_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Erro ao carregar conteúdo: HTTP ${response.status}`);
      }

      const content = await response.json();
      renderContent(content);
    } catch (error) {
      console.error("Falha ao carregar o conteúdo do site.", error);
      showLoadingError();
    }
  };

  const initializeNavigation = () => {
    const toggle = document.querySelector(".nav-toggle");
    const navigation = getElement("menu-principal");

    if (!toggle || !navigation) {
      return;
    }

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu de navegação");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    };

    const openMenu = () => {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu de navegação");
      navigation.classList.add("is-open");
      document.body.classList.add("menu-open");
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    DESKTOP_MEDIA_QUERY.addEventListener("change", (event) => {
      if (event.matches) {
        closeMenu();
      }
    });
  };

  const initializeHorizontalScrollers = () => {
    document.querySelectorAll("[data-scroll-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.dataset.scrollTarget;
        const direction = button.dataset.scrollDirection === "previous" ? -1 : 1;
        const target = getElement(targetId);

        if (!target) {
          return;
        }

        target.scrollBy({
          left: Math.max(target.clientWidth * 0.78, 260) * direction,
          behavior: REDUCED_MOTION_QUERY.matches ? "auto" : "smooth"
        });
      });
    });
  };

  const initializeDisabledActions = () => {
    document.addEventListener("click", (event) => {
      const disabledLink = event.target.closest('a[aria-disabled="true"]');

      if (disabledLink) {
        event.preventDefault();
      }
    });
  };

  const initializeBackToTop = () => {
    const button = getElement("voltar-ao-topo");

    if (!button) {
      return;
    }

    const updateVisibility = () => {
      button.hidden = window.scrollY < 500;
    };

    window.addEventListener("scroll", updateVisibility, { passive: true });

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: REDUCED_MOTION_QUERY.matches ? "auto" : "smooth"
      });
    });

    updateVisibility();
  };

  const initializeCurrentYear = () => {
    setText("ano-atual", String(new Date().getFullYear()));
  };

  const initializeApp = () => {
    initializeNavigation();
    initializeHorizontalScrollers();
    initializeDisabledActions();
    initializeBackToTop();
    initializeCurrentYear();
    loadContent();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
})();
