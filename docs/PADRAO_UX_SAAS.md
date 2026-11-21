# Padrão de interface

- Identidade: navy `#081C41`, laranja `#F97316`, azul `#1D6FE5`, claro `#F8FAFC`, escuro `#060E20`; títulos Bricolage, corpo Inter.
- Componentes em `src/components/ui/Base.tsx`: botões, campos, cartões, alertas, modal, skeleton, spinner.
- Botões: `primary`, `secondary`, `ghost`, `danger`, `navy`; alvo mínimo 44 px; `ButtonLink` para navegação (nunca `<a><button>`).
- Estados obrigatórios: carregamento, erro com retry, vazio com acção, sucesso confirmado pelo servidor.
- Formulários: erros junto ao campo, `aria-invalid`, foco no primeiro erro, confirmação antes de acções destrutivas.
- Modal: `role=dialog`, `aria-modal`, foco preso, Escape, devolução de foco.
- Movimento reduzido respeitado por CSS e por preferência.
- Texto por chaves em `src/i18n`; nenhuma frase solta em dois idiomas.
