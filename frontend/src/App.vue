<script>
import loginPage from "./components/loginPage.vue";
import documentsList from "./components/documentsList.vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { defineComponent, reactive, ref } from "vue";
import Document from "@tiptap/extension-document";
import { Color } from "@tiptap/extension-color";
export default defineComponent({
  name: "Document Manger",
  components: {
    loginPage,
    documentsList,
    EditorContent,
  },
  setup() {
    const currentlySelectedDocument = ref({});
    const state = reactive({
      loginPage: true,
      openDocument: false,
      actionSucess: false,
    });
    const userInfo = reactive({
      name: "",
      id: "",
    });

    function successfulLogin(user) {
      state.loginPage = false;
      userInfo.name = user.username;
      userInfo.id = user.id;
    }
    function updateSelectedDoc(document) {
      currentlySelectedDocument.value = document;
      state.openDocument = true;
      updateContent();
    }

    const editor = useEditor({
      content: "placeholder",
      extensions: [StarterKit, Color],
    });
    function updateContent() {
      editor.value.commands.setContent(currentlySelectedDocument.value.content);
    }

    function saveDocument() {
      const content = editor.value.getHTML();
      const id = currentlySelectedDocument.value.id;
      const data = {
        content,
        id,
      };
      fetch("http://localhost:3000/documents/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.status === 200) {
            state.actionSucess = true;
            console.log("Saved");
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            console.log(data.error);
          }
        });
      setTimeout(() => {
        state.actionSucess = false;
      }, 2000);
    }

    function deleteDocument() {
      const docId = currentlySelectedDocument.value.id;
      const userId = userInfo.id;
      fetch("http://localhost:3000/documents/delete/" + userId + "/" + docId, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.status === 200) {
            state.actionSucess = true;
            state.openDocument = false;
            console.log("Deleted");
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            console.log(data.error);
          }
        });
      setTimeout(() => {
        state.actionSucess = false;
      }, 2000);
    }

    return {
      state,
      userInfo,
      successfulLogin,
      currentlySelectedDocument,
      updateSelectedDoc,
      editor,
      updateContent,
      saveDocument,
      deleteDocument,
    };
  },
});
</script>
<template>
  <section class="loginContainer" v-if="state.loginPage">
    <loginPage @loginSuccess="successfulLogin" />
  </section>
  <main v-else>
    <header class="flex flex-col text-2xl text-center w-full">
      <h1>Dokument Hanterare</h1>
      <h2>Välkommen {{ userInfo.name }}</h2>
    </header>
    <section class="flex mt-6">
      <article class="documentsContainer text-center text-accent pt-4">
        <h2 class="text-2xl">Dina Dokument</h2>
        <documentsList
          @updateSelectedContent="updateSelectedDoc"
          :userId="userInfo.id"
        />
      </article>
      <article class="mainContent">
        <h2 class="text-2xl m-4 text-accent">
          Hantera Dokument -
          <span class="text-info">{{ currentlySelectedDocument.title }}</span>
        </h2>
        <div v-if="state.openDocument" class="flex">
          <div class="editorContainer">
            <editor-content :editor="editor" />
            <div v-if="editor" class="editorOptions">
              <input
                type="color"
                @input="
                  editor.chain().focus().setColor($event.target.value).run()
                "
                :value="editor.getAttributes('color').color"
              />
              <button
                @click="editor.chain().focus().setColor('#958DF1').run()"
                :class="{
                  'is-active': editor.isActive('color', {
                    color: '#958DF1',
                  }),
                }"
              >
                purple
              </button>
              <button
                @click="editor.chain().focus().setColor('#F98181').run()"
                :class="{
                  'is-active': editor.isActive('color', {
                    color: '#F98181',
                  }),
                }"
              >
                red
              </button>
              <button
                @click="editor.chain().focus().setColor('#FBBC88').run()"
                :class="{
                  'is-active': editor.isActive('color', {
                    color: '#FBBC88',
                  }),
                }"
              >
                orange
              </button>
              <button
                @click="editor.chain().focus().setColor('#FAF594').run()"
                :class="{
                  'is-active': editor.isActive('color', {
                    color: '#FAF594',
                  }),
                }"
              >
                yellow
              </button>
              <button
                @click="editor.chain().focus().setColor('#70CFF8').run()"
                :class="{
                  'is-active': editor.isActive('color', {
                    color: '#70CFF8',
                  }),
                }"
              >
                blue
              </button>
              <button
                @click="editor.chain().focus().setColor('#94FADB').run()"
                :class="{
                  'is-active': editor.isActive('color', {
                    color: '#94FADB',
                  }),
                }"
              >
                teal
              </button>
              <button
                @click="editor.chain().focus().setColor('#B9F18D').run()"
                :class="{
                  'is-active': editor.isActive('color', {
                    color: '#B9F18D',
                  }),
                }"
              >
                green
              </button>
              <button @click="editor.chain().focus().unsetColor().run()">
                unsetColor
              </button>

              <button
                @click="editor.chain().focus().toggleBold().run()"
                :disabled="!editor.can().chain().focus().toggleBold().run()"
                :class="{ 'is-active': editor.isActive('bold') }"
              >
                bold
              </button>
              <button
                @click="editor.chain().focus().toggleItalic().run()"
                :disabled="!editor.can().chain().focus().toggleItalic().run()"
                :class="{ 'is-active': editor.isActive('italic') }"
              >
                italic
              </button>
              <button
                @click="editor.chain().focus().toggleStrike().run()"
                :disabled="!editor.can().chain().focus().toggleStrike().run()"
                :class="{ 'is-active': editor.isActive('strike') }"
              >
                strike
              </button>
              <button
                @click="editor.chain().focus().toggleCode().run()"
                :disabled="!editor.can().chain().focus().toggleCode().run()"
                :class="{ 'is-active': editor.isActive('code') }"
              >
                code
              </button>
              <button @click="editor.chain().focus().unsetAllMarks().run()">
                clear marks
              </button>
              <button @click="editor.chain().focus().clearNodes().run()">
                clear nodes
              </button>
              <button
                @click="editor.chain().focus().setParagraph().run()"
                :class="{ 'is-active': editor.isActive('paragraph') }"
              >
                paragraph
              </button>
              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                "
                :class="{
                  'is-active': editor.isActive('heading', { level: 1 }),
                }"
              >
                h1
              </button>
              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                "
                :class="{
                  'is-active': editor.isActive('heading', { level: 2 }),
                }"
              >
                h2
              </button>
              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                "
                :class="{
                  'is-active': editor.isActive('heading', { level: 3 }),
                }"
              >
                h3
              </button>
              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                "
                :class="{
                  'is-active': editor.isActive('heading', { level: 4 }),
                }"
              >
                h4
              </button>
              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 5 }).run()
                "
                :class="{
                  'is-active': editor.isActive('heading', { level: 5 }),
                }"
              >
                h5
              </button>
              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 6 }).run()
                "
                :class="{
                  'is-active': editor.isActive('heading', { level: 6 }),
                }"
              >
                h6
              </button>
              <button
                @click="editor.chain().focus().toggleBulletList().run()"
                :class="{ 'is-active': editor.isActive('bulletList') }"
              >
                bullet list
              </button>
              <button
                @click="editor.chain().focus().toggleOrderedList().run()"
                :class="{ 'is-active': editor.isActive('orderedList') }"
              >
                ordered list
              </button>
              <button
                @click="editor.chain().focus().toggleCodeBlock().run()"
                :class="{ 'is-active': editor.isActive('codeBlock') }"
              >
                code block
              </button>
              <button
                @click="editor.chain().focus().toggleBlockquote().run()"
                :class="{ 'is-active': editor.isActive('blockquote') }"
              >
                blockquote
              </button>
              <button @click="editor.chain().focus().setHorizontalRule().run()">
                horizontal rule
              </button>
              <button @click="editor.chain().focus().setHardBreak().run()">
                hard break
              </button>
              <button
                @click="editor.chain().focus().undo().run()"
                :disabled="!editor.can().chain().focus().undo().run()"
              >
                undo
              </button>
              <button
                @click="editor.chain().focus().redo().run()"
                :disabled="!editor.can().chain().focus().redo().run()"
              >
                redo
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <button class="btn btn-success" @click="saveDocument">Spara</button>
            <button class="btn btn-error" @click="deleteDocument">
              Radera
            </button>
            <div
              v-if="state.actionSucess"
              class="alert alert-success shadow-lg"
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Handling Lyckades</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.editorContainer {
  width: 90%;
  padding: 20px;
  background-color: #fefefe;
  color: rgb(0, 0, 0);
  border: solid 1px #002b49;
  margin: 20px;
}
.mainContent {
  width: 100%;
  min-height: 500%;
  background-color: #11444c19;
  color: rgb(0, 0, 0);
  border: solid 1px #002b49;
}

.loginContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  width: 100vw;
}
.documentsContainer {
  widows: 400px;
  min-height: 500px;
  background-color: rgba(37, 32, 62, 0.664);
}
main {
  height: 100vh;
}

.editorOptions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  background-color: #002641d2;
  border-radius: 30px;
  padding: 5px;
}

.editorOptions button {
  margin: 5px;
  padding: 5px;
  border: none;
  background-color: #002b49;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
}
</style>
