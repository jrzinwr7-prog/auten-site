# BodyUp

Aplicação PWA **mobile-first**, em pt-BR, para jovens e iniciantes que desejam ganhar peso e massa muscular com treino em casa, rotina possível e orçamento limitado.

> O BodyUp organiza hábitos e apresenta estimativas iniciais. Ele não substitui profissionais de saúde, nutrição ou educação física.

## O que a primeira versão entrega

- Onboarding de perfil: idade, altura, peso, nível, local de treino, dias disponíveis, orçamento, meta e prazo.
- Plano de treino para casa com divisão adaptada a 2–4 dias por semana.
- Catálogo de exercícios, dicas de forma, avisos de segurança e registro de sessão.
- Regra de progressão: sugere a próxima variação após duas sessões no topo da faixa de repetições, com boa forma registrada.
- Estimativa inicial de calorias e proteína, receitas simples, checklist de compras e orçamento editável.
- Registro de refeições, peso semanal, medidas mensais e fotos de progresso.
- Gráfico de peso, marcos e previsão em faixa de 0,4–0,6 kg por semana.
- Conteúdo educativo curto sobre consistência, sono e mitos de treino.
- Lembretes opt-in de refeições, respeitando a permissão do navegador.
- PWA instalável e com recursos estáticos disponíveis offline após a primeira visita.
- Exportação/importação de backup JSON e exclusão local de dados.

## Privacidade e dados

Esta versão é **local-first**:

- Não requer conta, não possui backend e não envia perfil, fotos ou histórico para um servidor.
- O estado é guardado no IndexedDB do navegador, no dispositivo atual.
- Fotos são comprimidas localmente antes de serem gravadas.
- Limpar os dados do navegador pode apagar os registros; use **Exportar meu backup** periodicamente.
- A camada `src/storage/repository.ts` expõe um contrato pequeno para possibilitar sincronização futura apenas com consentimento explícito.

Os avisos de refeição dependem da permissão do navegador e, nesta primeira versão, são verificados enquanto o app está aberto. O produto nunca solicita notificações sem uma ação direta da pessoa usuária.

## Stack

- React 19 + TypeScript
- Vite
- `vite-plugin-pwa` / Workbox
- Dexie / IndexedDB
- Lucide React
- Manrope e Space Grotesk empacotadas localmente (sem chamada a CDN de fontes)
- Vitest para regras de domínio

## Executar localmente

Requer Node.js 22+ e npm.

```bash
npm install
npm run dev
```

O servidor abre em `http://localhost:5173` e aceita hosts de preview.

### Qualidade

```bash
npm run build  # valida TypeScript e gera o bundle PWA
npm test       # valida estimativas e regra de progressão
```

## Estrutura

```text
src/
  components/       # shell, modal e componentes do design system
  data/             # exercícios, refeições e conteúdo educativo
  domain/           # tipos, cálculos, gerador e progressão (funções puras)
  features/         # onboarding, dashboard, treino, alimentação, evolução e perfil
  fixtures/         # demonstração fictícia e opt-in, isolada do perfil de produção
  storage/          # repositório local e contrato para sincronização futura
  styles/           # tokens e estilos responsivos
```

## Decisões de produto

- **Nenhum dado pessoal de uma pessoa real é default do app.** A demonstração usa um perfil fictício e só é carregada ao tocar em “Explorar uma demonstração”.
- Alvos nutricionais, preços e previsão são apresentados como estimativas editáveis, não como promessa ou prescrição.
- Para pessoas menores de idade, o onboarding reforça que metas de peso e ingestão devem ser tratadas como ponto de partida e, quando possível, acompanhadas por profissionais.
- Exercícios com mesa, cadeiras ou degrau incluem avisos de estabilidade e segurança.

## Próximas extensões previstas

1. Editor de preço/quantidade por alimento e lista de compras por período.
2. Biblioteca de academia e substituições por equipamento.
3. Sincronização opcional, autenticação e política de privacidade pública.
4. Revisão do conteúdo técnico por nutricionista e profissional de educação física.
5. Testes e2e, telemetria anônima opt-in e acessibilidade ampliada.
