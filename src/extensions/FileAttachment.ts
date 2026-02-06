import { Node, mergeAttributes } from "@tiptap/core";

export const FileAttachment = Node.create({
  name: "fileAttachment",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      name: { default: null },
      size: { default: null },
      type: { default: null },
      src: { default: null }, 
    };
  },

  parseHTML() {
    return [{ tag: "div[data-file]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-file": "true",
        class: "file-attachment",
      }),
    ];
  },

 addNodeView() {
  return ({ node }) => {
    const wrapper = document.createElement("div");
    wrapper.className = "file-card";

    const title = document.createElement("div");
    title.innerText = node.attrs.name;
    title.className = "file-name";

    const actions = document.createElement("div");
    actions.className = "file-actions";

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "icon-btn";
    downloadBtn.type = "button";
    downloadBtn.title = "Download file";

    const downloadImg = document.createElement("img");
    downloadImg.src = "/src/assets/download.svg"; 
    downloadImg.alt = "Download";
    downloadImg.className = "download-icon";

    downloadBtn.appendChild(downloadImg);

    downloadBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = node.attrs.src;
      a.download = node.attrs.name;
      a.click();
    };

    actions.appendChild(downloadBtn);
    wrapper.append(title, actions);

    return { dom: wrapper };
  };
}

});
