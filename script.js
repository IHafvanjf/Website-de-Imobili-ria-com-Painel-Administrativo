// ==============================
// SLIDER PRINCIPAL (Swiper)
// ==============================
const sliderPrincipal = new Swiper('.swiper-container', {
  direction: 'vertical',
  effect: 'fade',
  speed: 1000,
  loop: true,
  allowTouchMove: false,
  mousewheel: false,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  on: {
    slideChange: function () {
      this.slides.forEach(slide => {
        const fundo = slide.querySelector('.background');
        if (fundo) fundo.classList.remove('animation');
      });
      const fundoAtivo = this.slides[this.activeIndex].querySelector('.background');
      if (fundoAtivo) fundoAtivo.classList.add('animation');
    }
  }
});

// ==============================
// ROLAÇÃO SUAVE COM EASING
// ==============================
function rolagemSuave(destinoEmPixels, duracaoEmMilissegundos = 800) {
  const posicaoInicial = window.pageYOffset;
  const distanciaTotal = destinoEmPixels - posicaoInicial;
  const tempoInicio = performance.now();
  function easingInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  function animarFrame(tempoAtual) {
    const tempoDecorrido = tempoAtual - tempoInicio;
    const proporcao = Math.min(tempoDecorrido / duracaoEmMilissegundos, 1);
    const proporcaoEased = easingInOutQuad(proporcao);
    window.scrollTo(0, posicaoInicial + distanciaTotal * proporcaoEased);
    if (proporcao < 1) {
      requestAnimationFrame(animarFrame);
    }
  }
  requestAnimationFrame(animarFrame);
}

// ==============================
// OBSERVADOR GLOBAL PARA REVEAL
// ==============================
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  });
}, {
  root: null,
  rootMargin: '0px 0px -100px 0px',
  threshold: 0
});

// ==============================
// LINKS DO MENU
// ==============================
document.querySelector('.main-menu a[href="#section-2"]').addEventListener('click', e => {
  e.preventDefault();
  sliderPrincipal.slideToLoop(0);
  rolagemSuave(0, 1000);
});
document.querySelector('.main-menu a[href="#section-5"]').addEventListener('click', e => {
  e.preventDefault();
  const secaoComprar = document.querySelector('#accommodations');
  const pos = secaoComprar.getBoundingClientRect().top + window.pageYOffset;
  rolagemSuave(pos, 1000);
});
document.querySelector('.main-menu a[href="#main-footer"]').addEventListener('click', e => {
  e.preventDefault();
  const secaoCorretores = document.querySelector('#about-team');
  const offset = 80;
  const pos = secaoCorretores.getBoundingClientRect().top + window.pageYOffset - offset;
  rolagemSuave(pos, 1200);
});

// ==============================
// VER DETALHES (dinâmico via PHP)
// ==============================

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.accommodations-grid');
  const filtroCasa = document.getElementById('filter-house');
  const filtroApto = document.getElementById('filter-apartment');
  const secaoAcomodacoes = document.querySelector('#accommodations');

  let listaImoveis = [];

  function carregarImoveis() {
    fetch('listar_imoveis_completo.php')
      .then(res => res.json())
      .then(data => {
        listaImoveis = data;
        renderizarImoveis();
      });
  }

  function renderizarImoveis() {
    grid.innerHTML = '';
    const tipoSelecionado = [];
    if (filtroCasa.checked) tipoSelecionado.push('casa');
    if (filtroApto.checked) tipoSelecionado.push('apartamento');

    const filtrados = tipoSelecionado.length
      ? listaImoveis.filter(item => tipoSelecionado.includes(item.tipo))
      : listaImoveis;

    filtrados.forEach((item, idx) => {
      const imgPrincipal = item.imagens[0] ? `${item.imagens[0]}` : 'img/placeholder.jpg';
      const miniaturas = item.imagens.slice(1, 4);
      const card = document.createElement('div');
      card.className = 'accommodation-card reveal';
      card.dataset.idx = idx;

      card.innerHTML = `
        <div class="accommodation-image" style="background-image: url('${imgPrincipal}');"></div>
        <div class="accommodation-gallery">
          ${miniaturas.map(url => `<div class="accommodation-thumb" style="background-image: url('${url}')"></div>`).join('')}
        </div>
        <div class="accommodation-features">
          <div class="feature-item"><i class="fa-solid fa-expand"></i><span>${item.area}m²</span></div>
          <div class="feature-item"><i class="fa-solid fa-toilet"></i><span>${item.banheiros} banheiros</span></div>
          <div class="feature-item"><i class="fa-solid fa-bed"></i><span>${item.quartos} quartos</span></div>
          <div class="feature-item"><i class="fa-solid fa-car"></i><span>${item.garagens} vagas</span></div>
        </div>
        <div class="accommodation-description">
          <h4>${item.titulo}</h4>
          <p>${item.descricao}</p>
        </div>
        <div class="accommodation-footer">
          <p class="accommodation-price">A partir de <strong>R$ ${parseFloat(item.valor).toLocaleString('pt-BR')}</strong></p>
          <button class="accommodation-button" data-idx="${idx}">Ver detalhes</button>
        </div>
      `;
      grid.appendChild(card);
    });
    aplicarEventosDetalhes();
    aplicarAnimacaoReveal();
  }

  function aplicarEventosDetalhes() {
    const botoes = document.querySelectorAll('.accommodation-button');
    botoes.forEach(botao => {
      botao.addEventListener('click', () => {
        const idx = parseInt(botao.dataset.idx);
        exibirDetalhes(idx);
      });
    });
  }

  function aplicarAnimacaoReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0
    });
    reveals.forEach(el => observer.observe(el));
  }

  function exibirDetalhes(idx) {
  const item = listaImoveis[idx];
  const painel = document.getElementById('detail-view');
  const banner = document.querySelector('.detail-banner-bg');
  const thumbs = document.querySelector('.detail-thumbs');
  const titulo = document.getElementById('detail-titulo');
  const desc = document.getElementById('detail-desc');
  const tipo = document.getElementById('detail-tipo');
  const endereco = document.getElementById('detail-endereco');
  const valor = document.getElementById('detail-valor');
  const features = document.getElementById('detail-features');
  const iframe = document.getElementById('detail-map-iframe');
  const linkMapa = document.getElementById('detail-map-link');

  // Banner principal
  banner.style.backgroundImage = `url('${item.imagens[0] || ''}')`;

  // Miniaturas
  thumbs.innerHTML = '';
  item.imagens.forEach((url, i) => {
    const img = document.createElement('img');
    img.src = url;
    if (i === 0) img.classList.add('active');
    img.onclick = () => {
      banner.style.backgroundImage = `url('${url}')`;
      thumbs.querySelectorAll('img').forEach(im => im.classList.remove('active'));
      img.classList.add('active');
    };
    thumbs.appendChild(img);
  });

  // Detalhes
  titulo.textContent = item.titulo;
  desc.textContent = item.descricao;
  tipo.textContent = item.tipo;
  endereco.textContent = `${item.rua}, ${item.numero} - CEP ${item.cep}`;
  valor.textContent = parseFloat(item.valor).toLocaleString('pt-BR');

  // Features
  features.innerHTML = `
    <div class="feature-item"><i class="fa-solid fa-expand"></i><span>${item.area}m²</span></div>
    <div class="feature-item"><i class="fa-solid fa-toilet"></i><span>${item.banheiros} banheiros</span></div>
    <div class="feature-item"><i class="fa-solid fa-bed"></i><span>${item.quartos} quartos</span></div>
    <div class="feature-item"><i class="fa-solid fa-car"></i><span>${item.garagens} vagas</span></div>
  `;

  // Mapa
  iframe.src = item.mapa_google;
  linkMapa.href = item.mapa_google.replace('/embed/v1/place?', '/place/?');

  // Mostrar painel
  document.querySelectorAll('main > section, .footer, .swiper-container')
    .forEach(el => el.classList.add('hidden'));
  painel.classList.remove('hidden');
}

  document.getElementById('btn-back').addEventListener('click', () => {
    document.getElementById('detail-view').classList.add('hidden');
    document.querySelectorAll('main > section, .footer, .swiper-container')
            .forEach(el => el.classList.remove('hidden'));
  });

  filtroCasa.addEventListener('change', renderizarImoveis);
  filtroApto.addEventListener('change', renderizarImoveis);

  carregarImoveis();
});

document.getElementById('form-contato').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const loader = document.getElementById("form-loader");

  // Mostrar loader
  loader.classList.remove("hidden");

  try {
    const response = await fetch('enviar_email.php', {
      method: 'POST',
      body: formData
    });

    const resultado = await response.json();

    if (resultado.sucesso) {
      form.reset();
      mostrarToast("Sua mensagem foi enviada com sucesso!");
    } else {
      mostrarToast("Erro ao enviar: " + (resultado.erro || 'Tente novamente.'), true);
    }
  } catch (err) {
    mostrarToast("Erro inesperado ao enviar o formulário.", true);
  } finally {
    // Esconder loader
    loader.classList.add("hidden");
  }
});

function mostrarToast(msg, erro = false) {
  const toast = document.getElementById("toast");
  toast.querySelector("span").textContent = msg;

  toast.style.backgroundColor = erro ? "#e64d0b" : "#ff6a28";
  toast.classList.add("show");
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, 4000);
}