"use strict";

(() => {
  const CONTENT_URL = "data/content.json";
  const MURAL_URL = "data/mural.json";
  const SITE_OPEN_AT_FALLBACK = "2026-08-08T22:00:00-03:00";
  const DESKTOP_MEDIA_QUERY = window.matchMedia("(min-width: 64rem)");
  const REDUCED_MOTION_QUERY = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  let siteAccessTimer = null;
  let sitePhaseTimer = null;

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

  const getSafeObjectPosition = (value) => {
    if (typeof value !== "string") {
      return "50% 28%";
    }

    const position = value.trim();
    const positionPattern = /^(?:left|center|right|\d{1,3}%)(?:\s+(?:top|center|bottom|\d{1,3}%))?$/;

    return positionPattern.test(position) ? position : "50% 28%";
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
    const galleryReleased = galeria.liberada === true;

    setText(
      "galeria-descricao",
      galeria.descricao,
      "Uma foto em destaque e outros registros para deslizar para o lado."
    );
    configureLink(
      getElement("link-album"),
      galleryReleased ? galeria.linkAlbum : ""
    );

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

    if (!galleryReleased) {
      mainFigure.hidden = true;
      thumbnails.replaceChildren();
      thumbnails.hidden = true;
      controls.hidden = true;
      emptyState.hidden = false;
      emptyState.textContent =
        galeria.indisponivel?.texto ||
        "As fotos ainda estão sendo preparadas para publicação.";
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

  const populateSaintProfileList = (list, values) => {
    if (!list) {
      return false;
    }

    const validValues = Array.isArray(values)
      ? values.filter(
          (value) => typeof value === "string" && value.trim()
        )
      : [];
    const fragment = document.createDocumentFragment();

    validValues.forEach((value) => {
      const item = document.createElement("li");
      item.textContent = value.trim();
      fragment.append(item);
    });

    list.replaceChildren(fragment);
    return validValues.length > 0;
  };

  const openSaintProfile = (saint = {}) => {
    const dialog = getElement("perfil-santo-dialogo");
    const details = saint.detalhes;

    if (!dialog || !details || typeof details !== "object") {
      return;
    }

    const saintName = saint.nome?.trim() || "Santo em destaque";
    const image = getElement("perfil-santo-imagem");
    const safeImage = getSafeUrl(saint.imagem);

    if (image && safeImage) {
      image.src = safeImage;
      image.alt =
        saint.textoAlternativo?.trim() || `Retrato de ${saintName}`;
      image.style.objectPosition = getSafeObjectPosition(
        saint.posicaoImagem
      );
      image.hidden = false;
    } else if (image) {
      image.removeAttribute("src");
      image.alt = "";
      image.hidden = true;
    }

    setText("perfil-santo-virtude", saint.virtude, "Testemunho jovem");
    setText("perfil-santo-nome", saintName);
    setText(
      "perfil-santo-frase",
      saint.frase?.trim() ? `“${saint.frase.trim()}”` : ""
    );
    setText("perfil-santo-nascimento", details.nascimento);
    setText("perfil-santo-morte", details.morte);
    setText(
      "perfil-santo-reconhecimento-titulo",
      details.reconhecimento?.titulo,
      "Reconhecimento"
    );
    setText(
      "perfil-santo-reconhecimento-data",
      details.reconhecimento?.data
    );

    const hasSymbols = populateSaintProfileList(
      getElement("perfil-santo-simbolos"),
      details.simbolos
    );
    const symbolsSection = getElement("perfil-santo-simbolos-secao");

    if (symbolsSection) {
      symbolsSection.hidden = !hasSymbols;
    }

    const hasFacts = populateSaintProfileList(
      getElement("perfil-santo-curiosidades"),
      details.curiosidades
    );
    const factsSection = getElement("perfil-santo-curiosidades-secao");

    if (factsSection) {
      factsSection.hidden = !hasFacts;
    }

    const source = getElement("perfil-santo-fonte");
    const safeSource = getSafeUrl(details.fonte?.url);

    if (source && safeSource) {
      source.href = safeSource;
      source.hidden = false;
      setText(
        "perfil-santo-fonte-rotulo",
        details.fonte?.rotulo,
        "Fonte oficial"
      );
    } else if (source) {
      source.hidden = true;
      source.removeAttribute("href");
    }

    if (!dialog.open) {
      dialog.showModal();
    }
  };

  const initializeSaintProfile = () => {
    const dialog = getElement("perfil-santo-dialogo");
    const closeButton = getElement("perfil-santo-fechar");

    if (!dialog || !closeButton) {
      return;
    }

    closeButton.addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
  };

  const renderSaints = (saints = []) => {
    const container = getElement("lista-santos");
    const template = getElement("modelo-santo");
    const controls = getElement("santos-controles");
    const previousButton = getElement("santos-anterior");
    const nextButton = getElement("santos-proximo");
    const summary = getElement("santos-resumo");
    const counter = getElement("santos-contador");
    const indicators = getElement("santos-indicadores");

    if (!container || !template) {
      return;
    }

    container.replaceChildren();

    if (indicators) {
      indicators.replaceChildren();
    }

    if (!Array.isArray(saints) || saints.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state empty-state--light";
      emptyState.textContent =
        "As histórias dos santos serão adicionadas em breve.";
      container.append(emptyState);

      if (controls) {
        controls.hidden = true;
      }

      if (summary) {
        summary.hidden = true;
      }

      return;
    }

    const fragment = document.createDocumentFragment();

    saints.forEach((saint, index) => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector(".saint-card");
      const image = clone.querySelector(".saint-card__image");
      const virtue = clone.querySelector(".saint-card__virtue");
      const name = clone.querySelector(".saint-card__name");
      const quote = clone.querySelector(".saint-card__quote");
      const summary = clone.querySelector(".saint-card__summary");
      const inspiration = clone.querySelector(
        ".saint-card__inspiration-text"
      );
      const detailsButton = clone.querySelector(
        ".saint-card__details-button"
      );

      if (!card || !name || !quote || !summary) {
        return;
      }

      const saintName = saint.nome?.trim() || "Santo em destaque";
      const hasImage = configureImage(
        image,
        saint.imagem,
        saint.textoAlternativo || `Retrato de ${saintName}`
      );

      card.dataset.saintIndex = String(index);
      card.setAttribute("aria-posinset", String(index + 1));
      card.setAttribute("aria-setsize", String(saints.length));
      card.classList.toggle("saint-card--without-image", !hasImage);

      if (image) {
        image.style.objectPosition = getSafeObjectPosition(
          saint.posicaoImagem
        );
      }

      if (virtue) {
        virtue.textContent = saint.virtude?.trim() || "Testemunho jovem";
      }

      name.textContent = saintName;
      quote.hidden = !saint.frase?.trim();
      quote.textContent = saint.frase?.trim() ? `“${saint.frase.trim()}”` : "";
      summary.textContent =
        saint.resumo?.trim() ||
        "Conheça um pouco mais sobre este testemunho de fé.";

      if (inspiration) {
        inspiration.textContent =
          saint.inspiracao?.trim() ||
          "Escolha hoje um gesto concreto de fé e amor.";
      }

      const hasDetails =
        saint.detalhes && typeof saint.detalhes === "object";

      if (detailsButton && hasDetails) {
        detailsButton.setAttribute(
          "aria-label",
          `Conheça a história de ${saintName}`
        );
        detailsButton.addEventListener("click", () => {
          openSaintProfile(saint);
        });
      } else if (detailsButton) {
        detailsButton.remove();
      }

      fragment.append(clone);
    });

    container.append(fragment);

    const cards = Array.from(container.querySelectorAll(".saint-card"));
    const hasMultipleSaints = cards.length > 1;

    if (controls) {
      controls.hidden = !hasMultipleSaints;
    }

    if (summary) {
      summary.hidden = !hasMultipleSaints;
    }

    let activeIndex = 0;
    let animationFrame = 0;

    const scrollToCard = (index) => {
      const safeIndex = Math.max(0, Math.min(index, cards.length - 1));
      const card = cards[safeIndex];

      if (!card) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const targetLeft =
        container.scrollLeft + cardRect.left - containerRect.left;

      container.scrollTo({
        left: targetLeft,
        behavior: REDUCED_MOTION_QUERY.matches ? "auto" : "smooth",
      });
      updateNavigation(safeIndex);
    };

    const indicatorButtons = cards.map((card, index) => {
      if (!indicators) {
        return null;
      }

      const button = document.createElement("button");
      const saintName = card.querySelector(".saint-card__name")?.textContent;

      button.className = "saints-summary__dot";
      button.type = "button";
      button.setAttribute(
        "aria-label",
        `Ir para ${saintName || `o santo ${index + 1}`}, ${index + 1} de ${cards.length}`
      );
      button.setAttribute("aria-current", index === 0 ? "true" : "false");
      button.addEventListener("click", () => scrollToCard(index));
      indicators.append(button);

      return button;
    });

    const getClosestCardIndex = () => {
      const containerLeft = container.getBoundingClientRect().left;

      return cards.reduce(
        (closest, card, index) => {
          const distance = Math.abs(
            card.getBoundingClientRect().left - containerLeft
          );

          return distance < closest.distance
            ? { index, distance }
            : closest;
        },
        { index: 0, distance: Number.POSITIVE_INFINITY }
      ).index;
    };

    const updateNavigation = (index = getClosestCardIndex()) => {
      activeIndex = Math.max(0, Math.min(index, cards.length - 1));

      if (counter) {
        counter.textContent = `Santo ${activeIndex + 1} de ${cards.length}`;
      }

      indicatorButtons.forEach((button, buttonIndex) => {
        if (button) {
          button.setAttribute(
            "aria-current",
            buttonIndex === activeIndex ? "true" : "false"
          );
        }
      });

      if (previousButton) {
        previousButton.disabled = activeIndex === 0;
      }

      if (nextButton) {
        nextButton.disabled = activeIndex === cards.length - 1;
      }
    };

    const scheduleNavigationUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        updateNavigation();
      });
    };

    container.addEventListener("scroll", scheduleNavigationUpdate, {
      passive: true
    });
    window.addEventListener("resize", scheduleNavigationUpdate, {
      passive: true
    });

    previousButton?.addEventListener("click", () => {
      scrollToCard(activeIndex - 1);
    });

    nextButton?.addEventListener("click", () => {
      scrollToCard(activeIndex + 1);
    });

    container.addEventListener("keydown", (event) => {
      const destinationByKey = {
        ArrowLeft: activeIndex - 1,
        ArrowRight: activeIndex + 1,
        Home: 0,
        End: cards.length - 1
      };

      if (!(event.key in destinationByKey)) {
        return;
      }

      event.preventDefault();
      scrollToCard(destinationByKey[event.key]);
    });

    updateNavigation(0);
  };

  const renderVideos = (videos = {}) => {
    const experience = getElement("video-experience");
    const emptyState = getElement("videos-vazio");
    const list = getElement("lista-videos");
    const template = getElement("modelo-video");
    const frame = getElement("video-player-frame");
    const playButton = getElement("video-play-button");
    const previewImage = getElement("video-preview-image");
    const previewTitle = getElement("video-preview-title");

    setText(
      "videos-descricao",
      videos.descricao,
      "Músicas que fizeram parte do nosso encontro."
    );

    if (
      !experience ||
      !emptyState ||
      !list ||
      !template ||
      !frame ||
      !playButton ||
      !previewImage ||
      !previewTitle
    ) {
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
      frame.replaceChildren(playButton);
      previewImage.removeAttribute("src");
      previewImage.alt = "";
      return;
    }

    const buttons = [];
    let selectedIndex = 0;

    const showPreview = (item) => {
      previewImage.src =
        `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
      previewImage.alt = `Capa do vídeo ${item.title}`;
      previewTitle.textContent = `Reproduzir ${item.title}`;
      playButton.setAttribute(
        "aria-label",
        `Reproduzir ${item.title}${item.artist ? `, de ${item.artist}` : ""}`
      );
      frame.replaceChildren(playButton);
    };

    const selectVideo = (index) => {
      const item = items[index];

      if (!item) {
        return;
      }

      selectedIndex = index;
      showPreview(item);

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

    const playSelectedVideo = () => {
      const item = items[selectedIndex];

      if (!item) {
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.className = "video-player-card__iframe";
      iframe.src =
        `https://www.youtube-nocookie.com/embed/${item.videoId}` +
        "?autoplay=1&rel=0&playsinline=1";
      iframe.title =
        `${item.title}, por ${item.artist || "artista convidado"}`;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; " +
        "gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;

      frame.replaceChildren(iframe);
    };

    playButton.addEventListener("click", playSelectedVideo);

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
    const controls = getElement("mural-controles");
    const previousButton = getElement("mural-anterior");
    const nextButton = getElement("mural-proxima");
    const summary = getElement("mural-resumo");
    const counter = getElement("mural-contador");
    const indicators = getElement("mural-indicadores");

    setText(
      "mural-descricao",
      mural.descricao,
      "Deixe uma mensagem de fé, carinho, gratidão ou encorajamento."
    );
    setText(
      "mural-aviso-moderacao",
      mural.avisoModeracao,
      "As mensagens são identificadas e revisadas antes da publicação."
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
        item?.publicada !== false &&
        typeof item?.nome === "string" &&
        item.nome.trim() &&
        typeof item?.mensagem === "string" &&
        item.mensagem.trim()
      );
    });

    container.replaceChildren();

    if (indicators) {
      indicators.replaceChildren();
    }

    if (messages.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state empty-state--light";
      emptyState.textContent =
        typeof mural.mensagemVazia === "string" && mural.mensagemVazia.trim()
          ? mural.mensagemVazia.trim()
          : "As primeiras mensagens aprovadas aparecerão aqui.";
      container.append(emptyState);

      if (controls) {
        controls.hidden = true;
      }

      if (summary) {
        summary.hidden = true;
      }

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

      if (item.destaque === true) {
        card.classList.add("mural-card--featured");
      }

      card.dataset.muralIndex = String(index);
      card.setAttribute("aria-posinset", String(index + 1));
      card.setAttribute("aria-setsize", String(messages.length));
      const authorName = item.nome.trim();
      const authorRole =
        typeof item.funcao === "string" ? item.funcao.trim() : "";
      const authorSignature = authorRole
        ? `${authorName} · ${authorRole}`
        : authorName;

      card.setAttribute(
        "aria-label",
        `Mensagem ${index + 1} de ${messages.length}, enviada por ${authorSignature}`
      );

      message.textContent = `“${item.mensagem.trim()}”`;
      author.textContent = `— ${authorSignature}`;
      fragment.append(clone);
    });

    container.append(fragment);

    const cards = Array.from(container.querySelectorAll(".mural-card"));
    const hasMultipleMessages = cards.length > 1;

    if (controls) {
      controls.hidden = !hasMultipleMessages;
    }

    if (summary) {
      summary.hidden = !hasMultipleMessages;
    }

    const indicatorButtons = cards.map((card, index) => {
      if (!indicators) {
        return null;
      }

      const button = document.createElement("button");
      button.className = "mural-summary__dot";
      button.type = "button";
      button.setAttribute("aria-label", `Ir para a mensagem ${index + 1}`);
      button.setAttribute("aria-current", index === 0 ? "true" : "false");

      button.addEventListener("click", () => {
        card.scrollIntoView({
          behavior: REDUCED_MOTION_QUERY.matches ? "auto" : "smooth",
          block: "nearest",
          inline: "start"
        });
      });

      indicators.append(button);
      return button;
    });

    let activeIndex = 0;
    let animationFrame = 0;

    const getClosestCardIndex = () => {
      const containerLeft = container.getBoundingClientRect().left;

      return cards.reduce(
        (closest, card, index) => {
          const distance = Math.abs(
            card.getBoundingClientRect().left - containerLeft
          );

          return distance < closest.distance
            ? { index, distance }
            : closest;
        },
        { index: 0, distance: Number.POSITIVE_INFINITY }
      ).index;
    };

    const updateNavigation = (index = getClosestCardIndex()) => {
      activeIndex = Math.max(0, Math.min(index, cards.length - 1));

      if (counter) {
        counter.textContent =
          `Mensagem ${activeIndex + 1} de ${cards.length}`;
      }

      indicatorButtons.forEach((button, buttonIndex) => {
        if (button) {
          button.setAttribute(
            "aria-current",
            buttonIndex === activeIndex ? "true" : "false"
          );
        }
      });

      if (previousButton) {
        previousButton.disabled = activeIndex === 0;
      }

      if (nextButton) {
        nextButton.disabled = activeIndex === cards.length - 1;
      }
    };

    const scheduleNavigationUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        updateNavigation();
      });
    };

    container.addEventListener("scroll", scheduleNavigationUpdate, {
      passive: true
    });
    window.addEventListener("resize", scheduleNavigationUpdate, {
      passive: true
    });

    previousButton?.addEventListener("click", () => {
      updateNavigation(Math.max(activeIndex - 1, 0));
    });

    nextButton?.addEventListener("click", () => {
      updateNavigation(Math.min(activeIndex + 1, cards.length - 1));
    });

    updateNavigation(0);
  };

  const TEST_HOSTS = new Set(["localhost", "127.0.0.1"]);

  const parseDateKey = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return Math.floor(date.getTime() / 86400000);
  };

  const getDateKeyInTimeZone = (date, timeZone) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);

    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
  };

  const getSiteNow = () => {
    const current = new Date();

    if (!TEST_HOSTS.has(window.location.hostname)) {
      return current;
    }

    const parameters = new URLSearchParams(window.location.search);
    const testValue =
      parameters.get("siteData") || parameters.get("missaoData");

    if (!testValue) {
      return current;
    }

    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(testValue)
      ? `${testValue}T12:00:00-03:00`
      : testValue;
    const simulated = new Date(normalized);

    return Number.isNaN(simulated.getTime()) ? current : simulated;
  };

  const getSiteAccessTarget = (states = {}) => {
    const configuredValue = states.inicioPosEvento;
    const configuredTarget = new Date(configuredValue || "");

    if (!Number.isNaN(configuredTarget.getTime())) {
      return {
        date: configuredTarget,
        value: configuredValue,
        configured: true
      };
    }

    return {
      date: new Date(SITE_OPEN_AT_FALLBACK),
      value: SITE_OPEN_AT_FALLBACK,
      configured: false
    };
  };

  const formatSiteAccessCountdown = (target, now) => {
    const difference = Math.max(0, target.getTime() - now.getTime());
    const totalSeconds = Math.ceil(difference / 1000);
    const totalHours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];

    if (totalHours > 0) {
      parts.push(`${totalHours} ${totalHours === 1 ? "hora" : "horas"}`);
    }

    if (minutes > 0 || totalHours > 0) {
      parts.push(`${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);
    }

    parts.push(`${seconds} ${seconds === 1 ? "segundo" : "segundos"}`);

    const readable =
      parts.length === 1
        ? parts[0]
        : `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}`;

    return {
      totalSeconds,
      hours: String(totalHours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
      readable: `Faltam ${readable} para o site abrir.`
    };
  };

  const renderSiteAccess = (states = {}) => {
    const target = getSiteAccessTarget(states);
    const now = getSiteNow();
    const locked = now < target.date;
    const gate = getElement("site-gate");
    const accessContent = states.acessoFechado || {};

    document.body.dataset.siteAccess = locked ? "locked" : "open";

    if (gate) {
      gate.hidden = !locked;
      gate.setAttribute("aria-hidden", String(!locked));
      gate.setAttribute("aria-busy", "false");
    }

    if (!locked) {
      delete document.body.dataset.siteAccessImminent;
      return { locked, now, target: target.date };
    }

    document.body.classList.remove("menu-open");
    setText(
      "site-gate-eyebrow",
      accessContent.selo,
      "1º Lual da Perseverança"
    );
    setText(
      "site-gate-title",
      accessContent.titulo,
      "Este site abre hoje às 22h"
    );
    setText(
      "site-gate-message",
      accessContent.texto,
      "Agora é hora de viver o Lual por inteiro. Depois do encerramento, volte aqui para continuar sua missão."
    );
    setText(
      "site-gate-opening",
      accessContent.horario,
      "Abertura às 22h · Horário de Brasília"
    );
    setText(
      "site-gate-opening-note",
      accessContent.avisoAutomatico,
      "O conteúdo será liberado automaticamente quando a contagem chegar ao fim."
    );

    const opening = getElement("site-gate-opening");

    if (opening) {
      opening.setAttribute("datetime", target.value);
    }

    const countdown = formatSiteAccessCountdown(target.date, now);
    const imminent = countdown.totalSeconds <= 300;
    const countdownElement = getElement("site-gate-countdown");

    document.body.dataset.siteAccessImminent = String(imminent);
    setText("site-gate-hours", countdown.hours, "00");
    setText("site-gate-minutes", countdown.minutes, "00");
    setText("site-gate-seconds", countdown.seconds, "00");
    setText(
      "site-gate-countdown-label",
      imminent ? "Está quase na hora!" : accessContent.contagemRotulo,
      "Falta pouco para abrir"
    );

    if (countdownElement) {
      countdownElement.setAttribute("aria-label", countdown.readable);
    }

    return { locked, now, target: target.date };
  };

  const startSiteAccessClock = (states = {}, galeria = {}) => {
    if (siteAccessTimer) {
      window.clearInterval(siteAccessTimer);
      siteAccessTimer = null;
    }

    const hasPhaseConfiguration =
      typeof states.inicioPosEvento === "string" &&
      states.inicioPosEvento.trim();

    const updateAccess = () => {
      const wasLocked = document.body.dataset.siteAccess !== "open";
      const access = renderSiteAccess(states);

      if (!access.locked) {
        if (wasLocked && hasPhaseConfiguration) {
          renderSitePhase(states, galeria);
        }

        if (siteAccessTimer) {
          window.clearInterval(siteAccessTimer);
          siteAccessTimer = null;
        }
      }

      return access;
    };

    const access = updateAccess();

    if (access.locked) {
      siteAccessTimer = window.setInterval(updateAccess, 1000);
    }
  };

  const configureInternalAction = (id, action = {}, fallback = {}) => {
    const element = getElement(id);

    if (!element) {
      return;
    }

    const text =
      typeof action.texto === "string" && action.texto.trim()
        ? action.texto.trim()
        : fallback.texto || "Continuar";
    const destination =
      typeof action.destino === "string" && /^#[A-Za-z][\w-]*$/.test(action.destino)
        ? action.destino
        : fallback.destino || "#mensagem";

    element.textContent = text;
    element.href = destination;
  };

  const formatRemainingTime = (target, now) => {
    const difference = Math.max(0, target.getTime() - now.getTime());
    const totalMinutes = Math.ceil(difference / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 1) {
      return `Faltam ${days} dias`;
    }

    if (days === 1) {
      return hours > 0 ? `Falta 1 dia e ${hours}h` : "Falta 1 dia";
    }

    if (hours > 0) {
      return `Faltam ${hours}h e ${minutes}min`;
    }

    if (minutes > 0) {
      return `Faltam ${minutes} minutos`;
    }

    return "É agora";
  };

  const resolveSitePhase = (states = {}, now = getSiteNow()) => {
    const eventDay = new Date(states.inicioDiaEvento || "");
    const postEvent = new Date(states.inicioPosEvento || "");

    if (
      Number.isNaN(eventDay.getTime()) ||
      Number.isNaN(postEvent.getTime()) ||
      eventDay >= postEvent
    ) {
      return {
        key: "depois",
        content: states.depois || {},
        now,
        eventDay,
        postEvent,
        valid: false
      };
    }

    if (now < eventDay) {
      return {
        key: "antes",
        content: states.antes || {},
        now,
        eventDay,
        postEvent,
        valid: true
      };
    }

    if (now < postEvent) {
      return {
        key: "dia-evento",
        content: states.diaEvento || {},
        now,
        eventDay,
        postEvent,
        valid: true
      };
    }

    return {
      key: "depois",
      content: states.depois || {},
      now,
      eventDay,
      postEvent,
      valid: true
    };
  };

  const configurePhaseLock = (sectionId, locked, content = {}) => {
    const section = getElement(sectionId);
    const lock = getElement(`${sectionId}-bloqueio`);

    if (!section || !lock) {
      return;
    }

    section.classList.toggle("is-phase-locked", locked);
    lock.hidden = !locked;

    if (locked) {
      setText(`${sectionId}-bloqueio-selo`, content.selo, "Disponível após o encontro");
      setText(
        `${sectionId}-bloqueio-titulo`,
        content.titulo,
        "Esta parte será liberada depois do Lual"
      );
      setText(
        `${sectionId}-bloqueio-texto`,
        content.texto,
        "Volte ao site após o encerramento para acessar esta parte."
      );
      section.setAttribute("aria-disabled", "true");
    } else {
      section.removeAttribute("aria-disabled");
    }
  };

  const updatePhaseMetadata = (description) => {
    if (typeof description !== "string" || !description.trim()) {
      return;
    }

    const descriptionMeta = document.querySelector('meta[name="description"]');
    const openGraphDescription = document.querySelector(
      'meta[property="og:description"]'
    );

    if (descriptionMeta) {
      descriptionMeta.content = description.trim();
    }

    if (openGraphDescription) {
      openGraphDescription.content = description.trim();
    }
  };

  const renderSitePhase = (states = {}, galeria = {}) => {
    const phase = resolveSitePhase(states);
    const content = phase.content || {};
    const banner = getElement("estado-site");
    const isAfter = phase.key === "depois";
    const galleryReleased = galeria.liberada === true;
    const photosAvailable = isAfter && galleryReleased;
    const photosLockContent = isAfter
      ? galeria.indisponivel || {}
      : content.bloqueio || {};

    document.body.dataset.sitePhase = phase.key;
    document.body.dataset.galleryReleased = String(galleryReleased);

    if (banner) {
      banner.hidden = false;
    }

    setText("estado-site-selo", content.selo, "Lual da Perseverança");
    setText("estado-site-titulo", content.titulo, "Nossa caminhada continua");
    setText("estado-site-texto", content.texto, "Permaneça conosco nesta caminhada.");
    setText("evento-subtitulo", content.heroSubtitulo, "A santidade também é para os jovens.");

    const primaryAction =
      isAfter && !galleryReleased
        ? {
            texto: "Ouvir as músicas",
            destino: "#videos"
          }
        : content.acaoPrincipal;

    configureInternalAction("acao-principal", primaryAction, {
      texto: isAfter
        ? galleryReleased
          ? "Reviver o Lual"
          : "Ouvir as músicas"
        : "Conhecer os santos",
      destino: isAfter
        ? galleryReleased
          ? "#fotos"
          : "#videos"
        : "#santos"
    });
    configureInternalAction("acao-secundaria", content.acaoSecundaria, {
      texto: isAfter ? "Ver missão de hoje" : "Preparar o coração",
      destino: isAfter ? "#missao" : "#mensagem"
    });

    setText("mensagem-selo", content.mensagem?.selo, "Esta noite continua");
    setText("mensagem-titulo", content.mensagem?.titulo, "O encontro não termina aqui");
    setText("mensagem-destaque", content.mensagem?.destaque, "Nossa caminhada continua com Jesus.");
    setText("mensagem-texto", content.mensagem?.texto, "Leve esta experiência para a vida.");

    configurePhaseLock("fotos", !photosAvailable, photosLockContent);
    configurePhaseLock("videos", !isAfter, content.bloqueio);
    configurePhaseLock("habitos", !isAfter, content.bloqueio);
    configurePhaseLock("mural", !isAfter, content.bloqueio);
    updatePhaseMetadata(content.descricaoPagina);

    if (phase.key === "antes" && phase.valid) {
      setText("estado-site-contagem", formatRemainingTime(phase.eventDay, phase.now));
    } else if (phase.key === "dia-evento" && phase.valid) {
      setText(
        "estado-site-contagem",
        `Conteúdo completo em ${formatRemainingTime(phase.postEvent, phase.now).replace("Faltam ", "")}`
      );
    } else {
      setText(
        "estado-site-contagem",
        galleryReleased ? "Conteúdo liberado" : "Fotos em preparação"
      );
    }

    return phase;
  };

  const startSitePhaseClock = (states = {}, galeria = {}) => {
    if (sitePhaseTimer) {
      window.clearInterval(sitePhaseTimer);
    }

    sitePhaseTimer = window.setInterval(() => {
      renderSitePhase(states, galeria);
    }, 60000);
  };

  const readMissionProgress = (storageKey) => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : {};

      return {
        daily:
          parsed && typeof parsed.daily === "object" && parsed.daily
            ? parsed.daily
            : {},
        bonus:
          parsed && typeof parsed.bonus === "object" && parsed.bonus
            ? parsed.bonus
            : {}
      };
    } catch {
      return { daily: {}, bonus: {} };
    }
  };

  const writeMissionProgress = (storageKey, progress) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      // O site continua funcional mesmo quando o navegador bloqueia o armazenamento.
    }
  };

  const appendTextList = (container, values, className = "") => {
    if (!container) {
      return;
    }

    container.replaceChildren();

    (Array.isArray(values) ? values : []).forEach((value) => {
      if (typeof value !== "string" || !value.trim()) {
        return;
      }

      const item = document.createElement("li");
      item.textContent = value.trim();

      if (className) {
        item.className = className;
      }

      container.append(item);
    });
  };

  const createMissionCheckbox = ({
    id,
    label,
    checked,
    onChange,
    className = "mission-check"
  }) => {
    const wrapper = document.createElement("label");
    wrapper.className = className;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.setAttribute("aria-label", label);

    const visual = document.createElement("span");
    visual.className = "mission-check__box";
    visual.setAttribute("aria-hidden", "true");
    visual.textContent = "✓";

    const text = document.createElement("span");
    text.textContent = label;

    input.addEventListener("change", () => {
      onChange(id, input.checked);
      wrapper.classList.toggle("is-complete", input.checked);
    });

    wrapper.classList.toggle("is-complete", checked);
    wrapper.append(input, visual, text);
    return wrapper;
  };

  const renderMissionJourney = (missions = {}) => {
    const waiting = getElement("missoes-aguardando");
    const journey = getElement("missoes-jornada");
    const todayCard = getElement("missao-hoje-card");
    const finalChallenge = getElement("desafio-final");
    const previousSection = getElement("missoes-anteriores-secao");
    const previousList = getElement("missoes-anteriores");
    const bonusList = getElement("lista-desafios-bonus");
    const todayCheckbox = getElement("missao-concluida");

    setText(
      "missoes-descricao",
      missions.descricao,
      "Uma missão por dia para levar a experiência do Lual para a vida."
    );
    setText("missoes-frase", missions.frase, "");
    setText("missoes-chamada", missions.chamada, "");

    if (!waiting || !journey || !todayCard || !previousList || !bonusList) {
      return;
    }

    const cycle = missions.ciclo || {};
    const days = Array.isArray(missions.dias) ? missions.dias : [];
    const timeZone = cycle.fusoHorario || "America/Sao_Paulo";
    const startDayNumber = parseDateKey(cycle.dataInicial);
    const finalDayNumber = parseDateKey(cycle.dataEncontroFinal);
    const releaseDate = new Date(cycle.inicioLiberacao || "");
    const now = getSiteNow();
    const todayKey = getDateKeyInTimeZone(now, timeZone);
    const todayDayNumber = parseDateKey(todayKey);

    const configurationIsValid =
      days.length > 0 &&
      startDayNumber !== null &&
      finalDayNumber !== null &&
      !Number.isNaN(releaseDate.getTime()) &&
      todayDayNumber !== null;

    if (!configurationIsValid) {
      waiting.hidden = false;
      journey.hidden = true;
      setText(
        "missoes-aguardando-titulo",
        "Não foi possível carregar as missões"
      );
      setText(
        "missoes-aguardando-texto",
        "Tente novamente em alguns instantes."
      );
      return;
    }

    if (now < releaseDate) {
      waiting.hidden = false;
      journey.hidden = true;
      setText(
        "missoes-aguardando-titulo",
        "As missões começam depois do Lual"
      );
      setText(
        "missoes-aguardando-texto",
        "A primeira missão será liberada ao final do encontro, no sábado, 8 de agosto."
      );
      return;
    }

    waiting.hidden = true;
    journey.hidden = false;

    const dayDifference = todayDayNumber - startDayNumber;
    const isFinalDay = todayDayNumber >= finalDayNumber;
    const currentIndex = Math.min(Math.max(dayDifference, 0), days.length - 1);
    const availableCount = isFinalDay
      ? days.length
      : Math.min(currentIndex + 1, days.length);
    const currentMission = isFinalDay ? null : days[currentIndex];
    const previousMissions = isFinalDay
      ? days
      : days.slice(0, currentIndex);
    const storageKey = `psiloyola.missoes.${cycle.id || "lual"}`;
    const progress = readMissionProgress(storageKey);

    const saveProgress = () => {
      writeMissionProgress(storageKey, progress);
      updateProgress();
    };

    const updateDailyProgress = (id, checked) => {
      progress.daily[id] = checked;
      saveProgress();
    };

    const updateBonusProgress = (id, checked) => {
      progress.bonus[id] = checked;
      saveProgress();
    };

    const updateProgress = () => {
      const availableIds = days.slice(0, availableCount).map((day) => day.id);
      const completed = availableIds.filter((id) => progress.daily[id]).length;
      const percentage = availableCount
        ? Math.round((completed / availableCount) * 100)
        : 0;
      const progressElement = getElement("missoes-progresso");
      const progressBar = getElement("missoes-progresso-barra");

      setText(
        "missoes-progresso-contador",
        `${completed} de ${availableCount}`,
        "0 de 0"
      );
      setText(
        "missoes-progresso-texto",
        completed === availableCount && availableCount > 0
          ? "Você concluiu todas as missões liberadas até agora. Continue firme!"
          : "Cada pequena atitude ajuda a manter acesa a luz que começou no Lual."
      );

      if (progressElement) {
        progressElement.setAttribute("aria-valuemax", String(availableCount));
        progressElement.setAttribute("aria-valuenow", String(completed));
      }

      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
      }

      if (finalChallenge) {
        const bonusItems = Array.isArray(missions.bonus?.itens)
          ? missions.bonus.itens
          : [];
        const completedBonus = bonusItems.filter(
          (item) => progress.bonus[item.id]
        ).length;
        setText(
          "desafio-final-resumo",
          `Você concluiu ${completed} de ${days.length} missões diárias e ${completedBonus} desafio${completedBonus === 1 ? " especial" : "s especiais"}.`
        );
      }
    };

    if (currentMission) {
      todayCard.hidden = false;
      setText("missao-dia", currentMission.dia, "Missão de hoje");
      setText(
        "missao-posicao",
        `${currentIndex + 1} de ${days.length}`,
        ""
      );
      setText("missao-tipo", currentMission.tipo, "Missão de hoje");
      setText("missao-nome", currentMission.titulo, "Sua missão continua");
      setText("missao-descricao", currentMission.descricao, "");
      setText(
        "missao-passagem-texto",
        currentMission.passagem?.texto,
        ""
      );
      setText(
        "missao-referencia",
        currentMission.passagem?.referencia,
        ""
      );
      setText("missao-proximo-passo", currentMission.proximoPasso, "");
      appendTextList(getElement("missao-acoes"), currentMission.acoes);

      const descriptionElement = getElement("missao-descricao");
      const oldObservation = todayCard.querySelector(
        ".daily-mission-card__observation"
      );
      oldObservation?.remove();

      if (currentMission.observacao && descriptionElement) {
        const observation = document.createElement("p");
        observation.className = "daily-mission-card__observation";
        observation.textContent = currentMission.observacao;
        descriptionElement.insertAdjacentElement("afterend", observation);
      }

      if (todayCheckbox) {
        todayCheckbox.checked = Boolean(progress.daily[currentMission.id]);
        todayCheckbox.onchange = () => {
          updateDailyProgress(currentMission.id, todayCheckbox.checked);
          todayCheckbox
            .closest(".mission-check")
            ?.classList.toggle("is-complete", todayCheckbox.checked);
        };
        todayCheckbox
          .closest(".mission-check")
          ?.classList.toggle(
            "is-complete",
            Boolean(progress.daily[currentMission.id])
          );
      }
    } else {
      todayCard.hidden = true;
    }

    previousList.replaceChildren();

    previousMissions.forEach((mission) => {
      const card = document.createElement("article");
      card.className = "released-mission-card";
      card.classList.toggle("is-complete", Boolean(progress.daily[mission.id]));

      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const titleWrap = document.createElement("span");
      const day = document.createElement("small");
      const title = document.createElement("strong");
      const indicator = document.createElement("span");

      day.textContent = mission.dia;
      title.textContent = mission.tipo;
      indicator.className = "released-mission-card__indicator";
      indicator.setAttribute("aria-hidden", "true");
      indicator.textContent = "+";
      titleWrap.append(day, title);
      summary.append(titleWrap, indicator);

      const body = document.createElement("div");
      body.className = "released-mission-card__body";

      const heading = document.createElement("h4");
      heading.textContent = mission.titulo;
      const description = document.createElement("p");
      description.textContent = mission.descricao;
      const actions = document.createElement("ul");
      appendTextList(actions, mission.acoes);
      const reference = document.createElement("p");
      reference.className = "released-mission-card__reference";
      reference.textContent = `${mission.passagem?.referencia || ""} — ${mission.passagem?.texto || ""}`;

      const checkbox = createMissionCheckbox({
        id: mission.id,
        label: "Marcar esta missão como concluída",
        checked: Boolean(progress.daily[mission.id]),
        onChange: (id, checked) => {
          updateDailyProgress(id, checked);
          card.classList.toggle("is-complete", checked);
        },
        className: "mission-check mission-check--compact"
      });

      body.append(heading, description, actions, reference, checkbox);
      details.append(summary, body);
      card.append(details);
      previousList.append(card);
    });

    if (previousSection) {
      previousSection.hidden = previousMissions.length === 0;
    }

    const bonusItems = Array.isArray(missions.bonus?.itens)
      ? missions.bonus.itens
      : [];
    setText(
      "desafios-bonus-descricao",
      missions.bonus?.descricao,
      "Eles podem ser realizados em qualquer momento da semana."
    );
    bonusList.replaceChildren();

    bonusItems.forEach((item) => {
      if (!item?.id || !item?.titulo) {
        return;
      }

      const card = document.createElement("article");
      card.className = "bonus-item";
      card.classList.toggle("is-complete", Boolean(progress.bonus[item.id]));

      const title = document.createElement("h4");
      title.textContent = item.titulo;
      card.append(title);

      if (item.descricao) {
        const description = document.createElement("p");
        description.textContent = item.descricao;
        card.append(description);
      }

      const checkbox = createMissionCheckbox({
        id: item.id,
        label: "Concluí este desafio",
        checked: Boolean(progress.bonus[item.id]),
        onChange: (id, checked) => {
          updateBonusProgress(id, checked);
          card.classList.toggle("is-complete", checked);
        },
        className: "mission-check mission-check--compact"
      });
      card.append(checkbox);
      bonusList.append(card);
    });

    if (finalChallenge) {
      finalChallenge.hidden = !isFinalDay;

      if (isFinalDay) {
        setText(
          "desafio-final-titulo",
          missions.desafioFinal?.titulo,
          "Nossa caminhada chegou ao encontro"
        );
        setText(
          "desafio-final-descricao",
          missions.desafioFinal?.descricao,
          "Prepare-se para compartilhar aquilo que viveu."
        );
        appendTextList(
          getElement("desafio-final-perguntas"),
          missions.desafioFinal?.perguntas
        );
      }
    }

    updateProgress();
  };

  const readFaithHabitSelection = (storageKey) => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : [];

      return Array.isArray(parsed)
        ? parsed.filter(
            (value) => typeof value === "string" && value.trim()
          )
        : [];
    } catch {
      return [];
    }
  };

  const writeFaithHabitSelection = (storageKey, selectedIds) => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(selectedIds))
      );
    } catch {
      // As escolhas continuam funcionando durante a visita atual.
    }
  };

  const renderFaithHabits = (habits = {}) => {
    const groupsContainer = getElement("lista-grupos-habitos");
    const groupTemplate = getElement("modelo-grupo-habitos");
    const habitTemplate = getElement("modelo-habito-fe");
    const plan = document.querySelector(".faith-habits__plan");
    const selection = getElement("habitos-selecao");
    const selectedList = getElement("habitos-escolhidos");
    const clearButton = getElement("habitos-limpar");
    const credit = getElement("habitos-credito");
    const creditLink = getElement("habitos-credito-link");

    setText("habitos-selo", habits.selo, "A missão continua");
    setText(
      "habitos-titulo",
      habits.titulo,
      "Pequenos hábitos, uma fé perseverante"
    );
    setText(
      "habitos-descricao",
      habits.descricao,
      "A santidade cresce nos pequenos costumes repetidos com amor."
    );
    setText(
      "habitos-plano-titulo",
      habits.tituloPlano,
      "Escolha três hábitos para começar"
    );
    setText(
      "habitos-orientacao",
      habits.orientacao,
      "Marque três atitudes que você deseja viver com mais constância."
    );
    setText(
      "habitos-frase-final",
      habits.fraseFinal,
      "A perseverança nasce de pequenos passos vividos com fidelidade."
    );

    if (
      !groupsContainer ||
      !groupTemplate ||
      !habitTemplate ||
      !selection ||
      !selectedList ||
      !clearButton
    ) {
      return;
    }

    const groups = Array.isArray(habits.grupos)
      ? habits.grupos.filter(
          (group) =>
            group &&
            typeof group === "object" &&
            Array.isArray(group.itens) &&
            group.itens.length > 0
        )
      : [];
    const selectionLimit =
      Number.isInteger(habits.limiteSelecao) && habits.limiteSelecao > 0
        ? habits.limiteSelecao
        : 3;
    const storageKey =
      typeof habits.storageKey === "string" && habits.storageKey.trim()
        ? habits.storageKey.trim()
        : "psiloyola.habitos-fe";
    const habitById = new Map();

    groups.forEach((group) => {
      group.itens.forEach((item) => {
        if (
          typeof item?.id === "string" &&
          item.id.trim() &&
          typeof item?.texto === "string" &&
          item.texto.trim()
        ) {
          habitById.set(item.id.trim(), item.texto.trim());
        }
      });
    });

    if (habitById.size === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent =
        "Os pequenos hábitos serão adicionados em breve.";
      groupsContainer.replaceChildren(emptyState);
      selection.hidden = true;

      if (plan) {
        plan.hidden = true;
      }

      return;
    }

    if (plan) {
      plan.hidden = false;
    }

    const savedIds = readFaithHabitSelection(storageKey)
      .filter((id) => habitById.has(id))
      .slice(0, selectionLimit);
    const selectedIds = new Set(savedIds);
    const controls = [];
    const groupDetails = [];
    const fragment = document.createDocumentFragment();
    let habitNumber = 0;

    groups.forEach((group, groupIndex) => {
      const validItems = group.itens.filter(
        (item) => habitById.has(item?.id?.trim())
      );

      if (validItems.length === 0) {
        return;
      }

      const clone = groupTemplate.content.cloneNode(true);
      const details = clone.querySelector(".faith-habit-group");
      const number = clone.querySelector(".faith-habit-group__number");
      const count = clone.querySelector(".faith-habit-group__count");
      const title = clone.querySelector(".faith-habit-group__title");
      const description = clone.querySelector(
        ".faith-habit-group__description"
      );
      const list = clone.querySelector(".faith-habit-group__list");

      if (!details || !number || !count || !title || !description || !list) {
        return;
      }

      details.open = groupIndex === 0;
      details.addEventListener("toggle", () => {
        if (!details.open) {
          return;
        }

        groupDetails.forEach((otherDetails) => {
          if (otherDetails !== details) {
            otherDetails.open = false;
          }
        });
      });
      groupDetails.push(details);
      number.textContent = String(groupIndex + 1).padStart(2, "0");
      count.textContent = `${validItems.length} hábito${validItems.length === 1 ? "" : "s"}`;
      title.textContent = group.titulo?.trim() || `Grupo ${groupIndex + 1}`;
      description.textContent = group.descricao?.trim() || "";
      description.hidden = !description.textContent;

      validItems.forEach((item) => {
        habitNumber += 1;

        const habitClone = habitTemplate.content.cloneNode(true);
        const label = habitClone.querySelector(".faith-habit-item");
        const input = habitClone.querySelector("input");
        const itemNumber = habitClone.querySelector(
          ".faith-habit-item__number"
        );
        const text = habitClone.querySelector(".faith-habit-item__text");

        if (!label || !input || !itemNumber || !text) {
          return;
        }

        const id = item.id.trim();
        const habitText = habitById.get(id);

        input.value = id;
        input.checked = selectedIds.has(id);
        input.setAttribute(
          "aria-label",
          `Quero viver este hábito: ${habitText}`
        );
        itemNumber.textContent = String(habitNumber).padStart(2, "0");
        text.textContent = habitText;

        input.addEventListener("change", () => {
          if (input.checked) {
            if (selectedIds.size >= selectionLimit) {
              input.checked = false;
              return;
            }

            selectedIds.add(id);
          } else {
            selectedIds.delete(id);
          }

          writeFaithHabitSelection(storageKey, selectedIds);
          updateSelectionView();
        });

        controls.push({ id, input, label });
        list.append(habitClone);
      });

      fragment.append(clone);
    });

    groupsContainer.replaceChildren(fragment);

    const updateSelectionView = () => {
      const selectedCount = selectedIds.size;
      const selectionIsFull = selectedCount >= selectionLimit;

      controls.forEach(({ id, input, label }) => {
        const isSelected = selectedIds.has(id);
        const isUnavailable = selectionIsFull && !isSelected;

        input.checked = isSelected;
        input.disabled = isUnavailable;
        label.classList.toggle("is-selected", isSelected);
        label.classList.toggle("is-unavailable", isUnavailable);
        label.setAttribute("aria-disabled", String(isUnavailable));
      });

      setText(
        "habitos-contador",
        `${selectedCount} de ${selectionLimit} ${selectedCount === 1 ? "escolhido" : "escolhidos"}`
      );

      selection.hidden = selectedCount === 0;
      selectedList.replaceChildren();

      selectedIds.forEach((id) => {
        const item = document.createElement("li");
        item.textContent = habitById.get(id);
        selectedList.append(item);
      });

      if (selectedCount > 0 && selectedCount < selectionLimit) {
        const remaining = selectionLimit - selectedCount;
        setText(
          "habitos-selecao-status",
          `${remaining === 1 ? "Falta" : "Faltam"} ${remaining} hábito${remaining === 1 ? "" : "s"} para completar seu pequeno plano.`
        );
      } else if (selectionIsFull) {
        setText(
          "habitos-selecao-status",
          "Seu pequeno plano está pronto. Comece com constância, não com pressa."
        );
      }
    };

    clearButton.onclick = () => {
      selectedIds.clear();
      writeFaithHabitSelection(storageKey, selectedIds);
      updateSelectionView();
      controls[0]?.input.focus();
    };

    const safeCreditUrl = getSafeUrl(habits.credito?.url);

    if (credit && creditLink && safeCreditUrl) {
      setText(
        "habitos-credito-texto",
        habits.credito?.texto,
        "Inspirado em uma reflexão compartilhada por"
      );
      creditLink.textContent = habits.credito?.nome?.trim() || "autor original";
      creditLink.href = safeCreditUrl;
      credit.hidden = false;
    } else if (credit) {
      credit.hidden = true;
    }

    writeFaithHabitSelection(storageKey, selectedIds);
    updateSelectionView();
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

  const renderContent = (content, muralData = {}) => {
    const muralContent = {
      ...(content.mural || {}),
      mensagens: Array.isArray(muralData?.mensagens)
        ? muralData.mensagens
        : []
    };

    if (muralData === null) {
      muralContent.mensagemVazia =
        "Não foi possível carregar as mensagens neste momento. Tente novamente mais tarde.";
    }

    renderEvent(content.evento);
    renderMessage(content.mensagem);
    renderGallery(content.galeria);
    renderSaints(content.santos);
    renderVideos(content.videos);
    renderMissionJourney(content.missoesSemana);
    renderFaithHabits(content.habitosFe);
    renderMural(muralContent);
    renderNextMeeting(content.proximoEncontro);
    renderSitePhase(content.estadosSite, content.galeria);
    startSitePhaseClock(content.estadosSite, content.galeria);
    startSiteAccessClock(content.estadosSite, content.galeria);
  };

  const showLoadingError = () => {
    const galleryEmpty = getElement("galeria-vazia");
    const galleryMain = getElement("galeria-destaque");
    const galleryList = getElement("galeria-miniaturas");
    const videoExperience = getElement("video-experience");
    const videosEmpty = getElement("videos-vazio");
    const saints = getElement("lista-santos");
    const saintsControls = getElement("santos-controles");
    const saintsSummary = getElement("santos-resumo");
    const habits = getElement("lista-grupos-habitos");
    const habitsPlan = document.querySelector(".faith-habits__plan");
    const habitsSelection = getElement("habitos-selecao");

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

    if (saintsControls) {
      saintsControls.hidden = true;
    }

    if (saintsSummary) {
      saintsSummary.hidden = true;
    }

    if (habits) {
      habits.replaceChildren();
      const message = document.createElement("p");
      message.className = "empty-state";
      message.textContent =
        "Não foi possível carregar os pequenos hábitos neste momento.";
      habits.append(message);
    }

    if (habitsPlan) {
      habitsPlan.hidden = true;
    }

    if (habitsSelection) {
      habitsSelection.hidden = true;
    }
  };

  const loadJson = async (url, label) => {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Erro ao carregar ${label}: HTTP ${response.status}`);
    }

    return response.json();
  };

  const loadContent = async () => {
    try {
      const muralRequest = loadJson(MURAL_URL, "mural").catch((error) => {
        console.error("Falha ao carregar o mural.", error);
        return null;
      });
      const [content, muralData] = await Promise.all([
        loadJson(CONTENT_URL, "conteúdo"),
        muralRequest
      ]);

      renderContent(content, muralData);
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
    startSiteAccessClock();
    initializeNavigation();
    initializeHorizontalScrollers();
    initializeDisabledActions();
    initializeBackToTop();
    initializeCurrentYear();
    initializeSaintProfile();
    loadContent();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
})();
