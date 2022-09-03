// @ts-nocheck
import tippy, { Props } from "tippy.js/headless";
// TODO: Use tippy headless to eliminate css override

tippy.setDefaultProps({ animation: false });

export default function tooltip(node: any, params: Partial<Props>) {
  const custom = params.content;
  const title = node.title;
  const label = node.getAttribute("aria-label");
  const defaultContent = custom || title || label;
  let content = defaultContent;

  // is set so our element is accessible:
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute
  // if (!label) node.setAttribute("aria-label", defaultContent);
  node.title = "";

  // Support any of the Tippy props by forwarding all "params":
  // https://atomiks.github.io/tippyjs/v6/all-props/
  const tip = tippy(node, {
    showOnCreate: false,
    content: defaultContent,
    onTrigger: (_, e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    // onHidden: (e) => {
    //   e.setProps({ content: "" });
    //   e.setProps({ content }); // Trick to make childrent re-render
    // },
    ...params,
    animation: false,
    onHide(instance) {
      requestAnimationFrame(instance.unmount);
    },
    render(instance) {
      // The recommended structure is to use the popper as an outer wrapper
      // element, with an inner `box` element
      const popper = document.createElement("div");
      const box = document.createElement("div");

      popper.appendChild(box);

      box.className = "nimbus-popup";
      box.innerHTML = instance.props.content;

      function onUpdate(prevProps, nextProps) {
        // DOM diffing
        if (prevProps.content !== nextProps.content) {
          box.innerHTML = nextProps.content;
        }
      }

      // Return an object with two properties:
      // - `popper` (the root popper element)
      // - `onUpdate` callback whenever .setProps() or .setContent() is called
      return {
        popper,
        onUpdate, // optional
      };
    },
  });

  // node.addEventListener("click", (e) => {
  //   e.stopPropagation();
  // });

  return {
    // If the props change, let's update the Tippy instance:
    update: (newParams: Props) => {
      content = newParams.content;
      tip.setProps({ content, ...newParams });
    },

    // Clean up the Tippy instance on unmount:
    destroy: () => tip.destroy(),
  };
}
