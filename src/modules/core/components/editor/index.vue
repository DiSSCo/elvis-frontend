<template>
  <div class="editor">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div class="menubar">
        <b-tooltip label="bold" type="is-dark" position="is-bottom">
          <button class="menu-button" :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
            <img svg-inline class="icon" src="./icons/bold.svg" alt="bold" />
          </button>
        </b-tooltip>

        <b-tooltip label="italic" type="is-dark" position="is-bottom">
          <button class="menu-button" :class="{ 'is-active': isActive.italic() }" @click="commands.italic">
            <img svg-inline class="icon" src="./icons/italic.svg" alt="italic" />
          </button>
        </b-tooltip>

        <b-tooltip label="underline" type="is-dark" position="is-bottom">
          <button class="menu-button" :class="{ 'is-active': isActive.underline() }" @click="commands.underline">
            <img svg-inline class="icon" src="./icons/underline.svg" alt="underline" />
          </button>
        </b-tooltip>

        <b-tooltip label="paragraph" type="is-dark" position="is-bottom">
          <button class="menu-button" :class="{ 'is-active': isActive.paragraph() }" @click="commands.paragraph">
            <img svg-inline class="icon" src="./icons/paragraph.svg" alt="paragraph" />
          </button>
        </b-tooltip>

        <b-tooltip label="heading H1" type="is-dark" position="is-bottom">
          <button
            class="menu-button"
            :class="{ 'is-active': isActive.heading({ level: 1 }) }"
            @click="commands.heading({ level: 1 })"
          >
            <span>H1</span>
          </button>
        </b-tooltip>

        <b-tooltip label="heading H2" type="is-dark" position="is-bottom">
          <button
            class="menu-button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })"
          >
            <span>H2</span>
          </button>
        </b-tooltip>

        <b-tooltip label="heading H3" type="is-dark" position="is-bottom">
          <button
            class="menu-button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })"
          >
            <span>H3</span>
          </button>
        </b-tooltip>

        <b-tooltip label="unordered list" type="is-dark" position="is-bottom">
          <button class="menu-button" :class="{ 'is-active': isActive.bullet_list() }" @click="commands.bullet_list">
            <img svg-inline class="icon" src="./icons/ul.svg" alt="ul" />
          </button>
        </b-tooltip>

        <b-tooltip label="anchor link" type="is-dark" position="is-bottom">
          <button class="menu-button" :class="{ 'is-active': isActive.link() }" @click="setUrl(commands.link)">
            <img svg-inline class="icon" src="./icons/link.svg" alt="link" />
          </button>
        </b-tooltip>

        <b-tooltip label="horizontal line" type="is-dark" position="is-bottom">
          <button class="menu-button" @click="commands.horizontal_rule">
            <img svg-inline class="icon" src="./icons/hr.svg" alt="hr" />
          </button>
        </b-tooltip>

        <b-tooltip label="undo" type="is-dark" position="is-bottom">
          <button class="menu-button" @click="commands.undo">
            <img svg-inline class="icon" src="./icons/undo.svg" alt="undo" />
          </button>
        </b-tooltip>

        <b-tooltip label="redo" type="is-dark" position="is-bottom">
          <button class="menu-button" @click="commands.redo">
            <img svg-inline class="icon" src="./icons/redo.svg" alt="redo" />
          </button>
        </b-tooltip>
      </div>
    </editor-menu-bar>

    <editor-content ref="element" class="editor-content" :editor="editor" />
    <div class="action-btns">
      <transition name="slide-down" mode="out-in">
        <span v-show="showMessage" class="has-text-weight-bold has-text-primary"
          ><i class="feather icon-check" /> content updated</span
        >
      </transition>
      <b-button type="is-primary" :loading="loading" @click="saveContent">
        {{ $t('save') }}
      </b-button>
    </div>
    <b-modal v-model="linkModalActive" :width="600">
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
            <b-button type="is-danger" :loading="removeLoading" @click="removeLink">
              {{ $t('remove') }}
            </b-button>
            <b-button type="is-primary" :loading="loading" @click="saveLink">
              {{ $t('save') }}
            </b-button>
          </div>
        </form>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap';
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History
} from 'tiptap-extensions';
import FieldRow from '@/modules/core/components/ui/formElements/FieldRow';

export default {
  components: {
    EditorContent,
    EditorMenuBar,
    FieldRow
  },

  props: {
    content: String
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
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History()
        ],
        content: this.content,
        onUpdate: ({ getHTML }) => {
          this.newContent = getHTML();
        }
      })
    };
  },

  created() {
    this.$root.$on('updateField', this.handleFormField);
  },

  beforeDestroy() {
    this.editor.destroy();
  },

  methods: {
    handleFormField(event) {
      this.linkUrl = event.value.value;
    },

    setUrl(command) {
      this.command = command;
      this.linkUrl = null;
      this.linkModalActive = true;
      const { state } = this.editor;
      const { from, to } = state.selection;
      let marks = [];
      state.doc.nodesBetween(from, to, node => {
        marks = [...marks, ...node.marks];
      });

      const mark = marks.find(markItem => markItem.type.name === 'link');

      if (mark && mark.attrs.href) {
        this.linkUrl = mark.attrs.href;
      }
    },

    saveLink() {
      this.loading = true;
      this.checkUrl();
      this.command({ href: this.linkUrl, target: '_blank' });
      setTimeout(() => {
        this.loading = false;
        this.linkModalActive = false;
      }, 500);
    },

    removeLink() {
      this.removeLoading = true;
      this.linkUrl = null;
      this.command({ href: null });
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
      const loadingComponent = this.$buefy.loading.open();
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
    }
  }
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

::v-deep .editor-content:focus,
::v-deep .ProseMirror,
::v-deep .ProseMirror-focused {
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
::v-deep li {
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
