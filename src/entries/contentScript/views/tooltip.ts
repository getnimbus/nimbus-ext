// @ts-nocheck
import tippy, { Props } from 'tippy.js';

export default function tooltip(node: any, params: Props) {
  const custom = params.content;
  const title = node.title;
  const label = node.getAttribute("aria-label");
  const defaultContent = custom || title || label;
  let content = defaultContent;

  // is set so our element is accessible:
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute
  if (!label) node.setAttribute("aria-label", defaultContent);
  node.title = "";

  // Support any of the Tippy props by forwarding all "params":
  // https://atomiks.github.io/tippyjs/v6/all-props/
  const tip = tippy(node, {
    content: defaultContent,
    onTrigger: (_, e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onHidden: (e) => {
      e.setProps({ content: '' })
      e.setProps({ content }) // Trick to make childrent re-render
    },
    ...params
  });

  node.addEventListener('click', (e) => {
    e.stopPropagation();
  })

  return {
    // If the props change, let's update the Tippy instance:
    update: (newParams: Props) => {
      content = newParams.content;
      tip.setProps({ content, ...newParams })
    },

    // Clean up the Tippy instance on unmount:
    destroy: () => tip.destroy(),
  };
};