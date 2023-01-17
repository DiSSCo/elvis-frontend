<template>
  <div class="editor">
    <editor-menu-bar :editor="editor">
      <div class="menubar">
        <o-tooltip label="bold" variant="primary" position="bottom">
          <button class="menu-button" :class="{ 'is-active': editor.isActive('bold') }"
            @click="editor.chain().focus().toggleBold().run()"
          >
            <img svg-inline class="icon" src="./icons/bold.svg" alt="bold" />
          </button>
        </o-tooltip>

        <o-tooltip label="italic" variant="primary" position="bottom">
          <button class="menu-button" :class="{ 'is-active': editor.isActive('italic') }"
            @click="editor.chain().focus().toggleItalic().run()"
          >
            <img svg-inline class="icon" src="./icons/italic.svg" alt="italic" />
          </button>
        </o-tooltip>

        <o-tooltip label="underline" variant="primary" position="bottom">
          <button class="menu-button" :class="{ 'is-active': editor.isActive('underline') }"
            @click="editor.chain().focus().toggleUnderline().run()"
          >
            <img svg-inline class="icon" src="./icons/underline.svg" alt="underline" />
          </button>
        </o-tooltip>

        <o-tooltip label="paragraph" variant="primary" position="bottom">
          <button class="menu-button" :class="{ 'is-active': editor.isActive('paragraph') }"
            @click="editor.chain().focus().setParagraph().run()"
          >
            <img svg-inline class="icon" src="./icons/paragraph.svg" alt="paragraph" />
          </button>
        </o-tooltip>

        <o-tooltip label="heading H1" variant="primary" position="bottom">
          <button
            @click="editor.chain().focus().setHeading({ level: 1 }).run()"
            class="menu-button" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
          >
            <span>H1</span>
          </button>
        </o-tooltip>

        <o-tooltip label="heading H2" variant="primary" position="bottom">
          <button
            @click="editor.chain().focus().setHeading({ level: 2 }).run()"
            class="menu-button" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
          >
            <span>H2</span>
          </button>
        </o-tooltip>

        <o-tooltip label="heading H3" variant="primary" position="bottom">
          <button
            @click="editor.chain().focus().setHeading({ level: 3 }).run()"
            class="menu-button" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
          >
            <span>H3</span>
          </button>
        </o-tooltip>

        <o-tooltip label="unordered list" variant="primary" position="bottom">
          <button class="menu-button" :class="{ 'is-active': editor.isActive('bulletList') }"
            @click="editor.chain().focus().toggleBulletList().run()"
          >
            <img svg-inline class="icon" src="./icons/ul.svg" alt="ul" />
          </button>
        </o-tooltip>

        <o-tooltip label="anchor link" variant="primary" position="bottom">
          <button class="menu-button" :class="{ 'is-active': editor.isActive('link') }"
            @click="setUrl()"
          >
            <img svg-inline class="icon" src="./icons/link.svg" alt="link" />
          </button>
        </o-tooltip>

        <o-tooltip label="horizontal line" variant="primary" position="bottom">
          <button class="menu-button" :class="{ 'is-active': editor.isActive('horizontalRule') }"
            @click="editor.chain().focus().setHorizontalRule().run()"
          >
            <img svg-inline class="icon" src="./icons/hr.svg" alt="hr" />
          </button>
        </o-tooltip>

        <o-tooltip label="undo" variant="primary" position="bottom">
          <button class="menu-button"
            @click="editor.chain().focus().undo().run()"
          >
            <img svg-inline class="icon" src="./icons/undo.svg" alt="undo" />
          </button>
        </o-tooltip>

        <o-tooltip label="redo" variant="primary" position="bottom">
          <button class="menu-button"
            @click="editor.chain().focus().redo().run()"
          >
            <img svg-inline class="icon" src="./icons/redo.svg" alt="redo" />
          </button>
        </o-tooltip>
      </div>
    </editor-menu-bar>

    <editor-content ref="element" class="editor-content" :editor="editor" />

    <div class="action-btns">
      <transition name="slide-down" mode="out-in">
        <span v-show="showMessage" class="has-text-weight-bold has-text-primary"
          ><i class="feather icon-check" /> content updated</span
        >
      </transition>
      <o-button variant="primary" :loading="loading" @click="saveContent">
        {{ $t('save') }}
      </o-button>
    </div>
    <o-modal v-model:active="linkModalActive">
      <div class="box">
        <h3 class="header">Update link</h3>
        <form @submit.prevent>
          <field-row
            field="StringField"
            label="Link"
            :value="linkUrl"
            :fieldOptions="{
              placeHolder: 'http(s)://...'
            }"
          />
          <div class="action-btns">
            <o-button variant="danger" :loading="removeLoading" @click="removeLink">
              {{ $t('remove') }}
            </o-button>
            <o-button variant="primary" :loading="loading" @click="saveLink">
              {{ $t('save') }}
            </o-button>
          </div>
        </form>
      </div>
    </o-modal>
  </div>
</template>

<script>
import {
  Editor, EditorContent,
} from '@tiptap/vue-3';
import { StarterKit } from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow.vue';

export default {
  components: {
    EditorContent,
    FieldRow,
  },

  props: {
    content: String,
  },

  data() {
    return {
      loading: false,
      removeLoading: false,
      showMessage: false,
      newContent: this.content,
      linkUrl: null,
      command: null,
      linkModalActive: false,
      editor: new Editor({
        extensions: [
          StarterKit,
          Underline,
          Link,
        ],
        content: this.content,
        onUpdate: ({ editor }) => {
          this.newContent = editor.getHTML();
        },
      }),
    };
  },

  created() {
    this.emitter.on('updateField', this.handleFormField);
  },

  beforeUnmount() {
    this.editor.destroy();
  },

  methods: {
    handleFormField(event) {
      this.linkUrl = event.value.value;
    },

    setUrl() {
      this.linkUrl = null;
      this.linkModalActive = true;
      const { state } = this.editor;
      const { from, to } = state.selection;
      let marks = [];
      state.doc.nodesBetween(from, to, (node) => {
        marks = [...marks, ...node.marks];
      });

      const mark = marks.find((markItem) => markItem.type.name === 'link');

      if (mark && mark.attrs.href) {
        this.linkUrl = mark.attrs.href;
      }
    },

    saveLink() {
      this.loading = true;
      this.checkUrl();
      this.editor.chain().focus().extendMarkRange('link').setLink({ href: this.linkUrl, target: '_blank' })
        .run();
      setTimeout(() => {
        this.loading = false;
        this.linkModalActive = false;
      }, 500);
    },

    removeLink() {
      this.removeLoading = true;
      this.linkUrl = null;
      this.editor.chain().focus().extendMarkRange('link').unsetLink()
        .run();
      setTimeout(() => {
        this.removeLoading = false;
        this.linkModalActive = false;
      }, 500);
    },

    checkUrl() {
      const regexUrl = /https?:\/\//g;
      const regexMail = /mailto/g;

      if (this.linkUrl && !this.linkUrl.match(regexUrl) && !this.linkUrl.match(regexMail)) {
        this.linkUrl = `http://${this.linkUrl}`;
      }
    },

    saveContent() {
      const loadingComponent = this.$oruga.loading.open();
      this.$emit('update', this.newContent);

      setTimeout(() => {
        loadingComponent.close();
        this.toggleMessage();
      }, 2000);
    },

    toggleMessage() {
      this.showMessage = true;
      setTimeout(() => {
        this.showMessage = false;
      }, 2000);
    },
  },
};
</script>

<style lang="scss" scoped>
.menubar {
  margin-bottom: 1rem;
  border-bottom: 1px solid $grey-dark;
  padding-bottom: 1em;
  transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: -1px;
  background: $white;
  z-index: 1;
  padding: 1em 0;

  &.is-hidden {
    visibility: hidden;
    opacity: 0;
  }

  &.is-focused {
    visibility: visible;
    opacity: 1;
    transition: visibility 0.2s, opacity 0.2s;
  }

  .menu-button {
    -ms-flex: 1;
    flex: 1;
    background: transparent;
    border: 0;
    color: $black;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2em;
    width: 2em;
    font-size: 12px;

    span {
      font-size: 14px;
      font-weight: 700;
    }

    &:hover,
    &.is-active {
      background-color: $blue;
      fill: $white;
      color: $white;
    }
  }

  span#{&}__button {
    font-size: 13.3333px;
  }
}

:deep(.editor-content:focus),
:deep(.ProseMirror),
:deep(.ProseMirror-focused) {
  outline: none;
}

.editor {
  position: relative;
  max-width: 30rem;
  margin: 0 auto 5rem auto;

  .editor-content {
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;

    * {
      caret-color: currentColor;
    }

    pre {
      padding: 0.7rem 1rem;
      border-radius: 5px;
      background: $black;
      color: $white;
      font-size: 0.8rem;
      overflow-x: auto;

      code {
        display: block;
      }
    }

    p code {
      padding: 0.2rem 0.4rem;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: bold;
      background: rgba($black, 0.1);
      color: rgba($black, 0.8);
    }

    ul,
    ol {
      padding-left: 1rem;
    }

    li > p,
    li > ol,
    li > ul {
      margin: 0;
    }

    a {
      color: inherit;
      text-decoration: none !important;
    }

    blockquote {
      border-left: 3px solid rgba($black, 0.1);
      color: rgba($black, 0.8);
      padding-left: 0.8rem;
      font-style: italic;

      p {
        margin: 0;
      }
    }

    img {
      max-width: 100%;
      border-radius: 3px;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;

      td,
      th {
        min-width: 1em;
        border: 2px solid $grey;
        padding: 3px 5px;
        vertical-align: top;
        box-sizing: border-box;
        position: relative;
        > * {
          margin-bottom: 0;
        }
      }

      th {
        font-weight: bold;
        text-align: left;
      }

      .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: '';
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(200, 200, 255, 0.4);
        pointer-events: none;
      }

      .column-resize-handle {
        position: absolute;
        right: -2px;
        top: 0;
        bottom: 0;
        width: 4px;
        z-index: 20;
        background-color: #adf;
        pointer-events: none;
      }
    }

    .tableWrapper {
      margin: 1em 0;
      overflow-x: auto;
    }

    .resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }
  }
}
:deep(li) {
  list-style-type: disc;

  li {
    list-style-type: circle;
  }
}
.action-btns {
  border-top: 1px solid $grey-dark;
  padding-top: 1em;
  justify-content: flex-end;
  align-items: center;
  .button {
    margin-left: 1em;
  }
}
</style>

<style lang="css">
.o-modal__content {
  width: 600px;
}
</style>
