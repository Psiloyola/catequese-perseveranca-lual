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
    const container = getElement("galeria");
    const template = getElement("modelo-foto");
    const albumLink = getElement("link-album");
    const description = document.querySelector(
      "#fotos .section-heading__description"
    );

    if (description && galeria.descricao) {
      description.textContent = galeria.descricao;
    }

    configureLink(albumLink, galeria.linkAlbum);

    if (!container || !template) {
      return;
    }

    const photos = Array.isArray(galeria.fotos) ? galeria.fotos : [];
    container.replaceChildren();

    if (photos.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent =
        "As fotos serão disponibilizadas após o evento.";
      container.append(emptyState);
      return;
    }

    const fragment = document.createDocumentFragment();

    photos.forEach((photo) => {
      const clone = template.content.cloneNode(true);
      const figure = clone.querySelector(".gallery-item");
      const image = clone.querySelector(".gallery-item__image");
      const caption = clone.querySelector(".gallery-item__caption");

      const configured = configureImage(
        image,
        photo.imagem,
        photo.textoAlternativo
      );

      if (!configured || !figure) {
        return;
      }

      if (caption) {
        caption.textContent =
          typeof photo.legenda === "string" ? photo.legenda.trim() : "";
      }

      fragment.append(clone);
    });

    if (!fragment.childNodes.length) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent =
        "Não foi possível carregar as fotos neste momento.";
      container.append(emptyState);
      return;
    }

    container.append(fragment);
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

  const getSafeYouTubeId = (value) => {
    if (typeof value !== "string") {
      return null;
    }

    const videoId = value.trim();

    return /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null;
  };

  const renderPlaylist = (playlist = {}) => {
    setText("playlist-musica", playlist.musica, "Música do Lual");
    setText("playlist-artista", playlist.artista, "");
    setText(
      "playlist-descricao",
      playlist.descricao,
      "Reencontre as músicas que fizeram parte dessa noite."
    );

    const player = getElement("youtube-player");
    const playerCard = getElement("youtube-card");
    const videoId = getSafeYouTubeId(playlist.videoId);

    if (player && playerCard && videoId) {
      player.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
      playerCard.hidden = false;
    } else {
      player?.removeAttribute("src");

      if (playerCard) {
        playerCard.hidden = true;
      }
    }

    configureLink(getElement("link-playlist"), playlist.link);
  };

  const renderMural = (mural = {}) => {
    const container = getElement("lista-mensagens");
    const template = getElement("modelo-mensagem");
    const description = getElement("mural-descricao");

    if (description && typeof mural.descricao === "string") {
      description.textContent = mural.descricao.trim();
    }

    configureLink(
      getElement("link-formulario-mural"),
      mural.linkFormulario
    );

    if (!container || !template) {
      return;
    }

    const messages = Array.isArray(mural.mensagens)
      ? mural.mensagens
      : [];

    container.replaceChildren();

    const approvedMessages = messages.filter((item) => {
      return (
        typeof item?.nome === "string" &&
        item.nome.trim() &&
        typeof item?.mensagem === "string" &&
        item.mensagem.trim()
      );
    });

    if (approvedMessages.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent =
        "As primeiras mensagens aprovadas aparecerão aqui.";
      container.append(emptyState);
      return;
    }

    const fragment = document.createDocumentFragment();

    approvedMessages.forEach((item) => {
      const clone = template.content.cloneNode(true);
      const message = clone.querySelector(".mural-card__message");
      const author = clone.querySelector(".mural-card__author");

      if (!message || !author) {
        return;
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
    renderPlaylist(content.playlist);
    renderMission(content.missao);
    renderMural(content.mural);
    renderNextMeeting(content.proximoEncontro);
  };

  const showLoadingError = () => {
    const gallery = getElement("galeria");
    const saints = getElement("lista-santos");

    if (gallery) {
      gallery.replaceChildren();
      const message = document.createElement("p");
      message.className = "empty-state";
      message.textContent =
        "Não foi possível carregar as fotos neste momento.";
      gallery.append(message);
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
