<script>
import loginPage from "./components/loginPage.vue";
import documentsList from "./components/documentsList.vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { defineComponent, reactive, ref, computed, watch } from "vue";
import Document from "@tiptap/extension-document";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";

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
      isEditable: false,
      updateKey: 0,
      areUSure: false,
      creatingNewDocument: false,
    });
    const userInfo = reactive({
      name: "",
      id: "",
    });
    const pickedBackgroundColor = ref("#ffffff");

    watch(pickedBackgroundColor, (newValue) => {
      console.log(newValue)
      editor.value.chain().focus().setHighlight({color:newValue}).run();
    });

    const newDocument = reactive({
      title: "",
      userId: userInfo.id,
    });

    function successfulLogin(user) {
      state.loginPage = false;
      userInfo.name = user.username;
      userInfo.id = user.id;
    }
    function updateSelectedDoc(document) {
      currentlySelectedDocument.value = document;
      state.openDocument = true;
      state.creatingNewDocument = false;
      state.isEditable = false;
      editor.value.setEditable(false);
      updateContent();
    }

 

    function unsetBackgroundColor() {
      editor.value.chain().focus().unsetHighlight().run();
    }

    const editor = useEditor({
      extensions: [
        StarterKit,
        Color,
        TextStyle,
        Document,
        Highlight.configure({ multicolor: true }),
      ],
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
            state.updateKey += 1;
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
            currentlySelectedDocument.value = {};

            state.openDocument = false;
            state.areUSure = false;
            state.updateKey += 1;
            console.log("Deleted");
            editor.value.commands.clearContent();
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            console.log(data.error);
          }
        });
    }

    const currentColor = computed(() => {
      const textStyle = editor.value.getAttributes("textStyle");
      return textStyle.color || "#000000";
    });

    function toggleEditable() {
      if (state.isEditable) {
        state.isEditable = false;
        editor.value.setEditable(false);
      } else {
        state.isEditable = true;
        editor.value.setEditable(true);
      }
    }

    function toggleCreateNewDocument() {
      if (state.creatingNewDocument) {
        state.creatingNewDocument = false;
        state.openDocument = true;
      } else {
        state.creatingNewDocument = true;
        state.openDocument = false;
      }
    }

    function createNewDocument() {
      const data = {
        title: newDocument.title,
        userId: userInfo.id,
      };
      console.log(data);
      fetch("http://localhost:3000/documents/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.status === 201) {
            console.log(Document + "Created");
          }
          return response.json();
        })
        .then(async (data) => {
          if (data.error) {
            console.log(data.error);
          }
          try {
            console.log(data);
            const doc = await getDocById(data.documentId);
            currentlySelectedDocument.value = doc;
            state.isEditable = true;
            state.updateKey += 1;
            editor.value.commands.clearContent();
            editor.value.setEditable(true);
            toggleCreateNewDocument();
          } catch (error) {
            console.log(error);
          }
        });
    }

    async function getDocById(id) {
      const response = await fetch("http://localhost:3000/documents/one/" + id);
      if (response.status === 200) {
        console.log("Got document");
      }
      const data = await response.json();
      if (data.error) {
        console.log(data.error);
      }
      return data;
    }

    function logOut() {
      state.loginPage = true;
      state.openDocument = false;
      state.actionSucess = false;
      state.isEditable = false;
      state.areUSure = false;
      state.creatingNewDocument = false;
      userInfo.name = "";
      userInfo.id = "";
      currentlySelectedDocument.value = {};
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
      currentColor,
      toggleEditable,
      newDocument,
      toggleCreateNewDocument,
      createNewDocument,
      logOut,
      pickedBackgroundColor,
      unsetBackgroundColor,
    };
  },
});
</script>
<template>
  <section class="loginContainer" v-if="state.loginPage">
    <loginPage @loginSuccess="successfulLogin" />
  </section>
  <main v-else>
    <button @click="logOut" class="btn btn-primary absolute left-4 top-4">
      Logga Ut
    </button>
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
          :key="state.updateKey"
        />
      </article>
      <article class="mainContent">
        <header class="flex justify-between h-12 m-4">
          <h2 class="text-3xl text-accent">
            Hantera Dokument -
            <span class="text-info">{{ currentlySelectedDocument.title }}</span>
          </h2>
          <button @click="toggleCreateNewDocument" class="btn btn-success mr-4">
            Skapa Nytt Dokument
          </button>
        </header>
        <div
          v-if="state.creatingNewDocument"
          class="newDocContainer text-info text-xl"
        >
          <h4>Skapa Nytt Dokument</h4>
          <div class="flex gap-4 justify-center content-center">
            <input
              v-model="newDocument.title"
              aria-label="titel till dokument"
              placeholder="Titel"
              class="input input-bordered input-info w-full max-w-xs"
              type="text"
              name="title"
              id="title"
            />
          </div>
          <div>
            <button @click="createNewDocument" class="btn btn-success w-2/3">
              Skapa
            </button>
            <button
              @click="toggleCreateNewDocument"
              class="btn btn-error w-1/3"
            >
              Avbryt
            </button>
          </div>
          <p class="text-neutral text-base">
            Spara eventuellt öppet dokument innan.
          </p>
        </div>
        <div v-if="state.openDocument" class="flex">
          <div class="editorContainer">
            <editor-content :editor="editor" />
            <div v-if="state.isEditable" class="editorOptions">
              <input
                type="color"
                @input="
                  editor.chain().focus().setColor($event.target.value).run()
                "
                :value="currentColor"
              />

              <button @click="editor.chain().focus().unsetColor().run()">
                Ta Bort Färg
              </button>

              <button
                @click="editor.chain().focus().toggleBold().run()"
                :disabled="!editor.can().chain().focus().toggleBold().run()"
                :class="{ 'is-active': editor.isActive('bold') }"
              >
                Bold
              </button>
              <button
                @click="editor.chain().focus().toggleItalic().run()"
                :disabled="!editor.can().chain().focus().toggleItalic().run()"
                :class="{ 'is-active': editor.isActive('italic') }"
              >
                Italic
              </button>
              <button
                @click="editor.chain().focus().toggleStrike().run()"
                :disabled="!editor.can().chain().focus().toggleStrike().run()"
                :class="{ 'is-active': editor.isActive('strike') }"
              >
                Stykning
              </button>
              <button
                @click="editor.chain().focus().toggleCode().run()"
                :disabled="!editor.can().chain().focus().toggleCode().run()"
                :class="{ 'is-active': editor.isActive('code') }"
              >
                Kod
              </button>
              <button @click="editor.chain().focus().unsetAllMarks().run()">
                Rensa Markeringar
              </button>

              <button
                @click="editor.chain().focus().setParagraph().run()"
                :class="{ 'is-active': editor.isActive('paragraph') }"
              >
                Paragraph
              </button>
              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                "
                :class="{
                  'is-active': editor.isActive('heading', { level: 1 }),
                }"
              >
                H1
              </button>
              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                "
                :class="{
                  'is-active': editor.isActive('heading', { level: 2 }),
                }"
              >
                H2
              </button>
              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                "
                :class="{
                  'is-active': editor.isActive('heading', { level: 3 }),
                }"
              >
                H3
              </button>
              <button
                @click="
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                "
                :class="{
                  'is-active': editor.isActive('heading', { level: 4 }),
                }"
              >
                H4
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
                H6
              </button>
              <button
                @click="editor.chain().focus().toggleBulletList().run()"
                :class="{ 'is-active': editor.isActive('bulletList') }"
              >
                Punkt Lista
              </button>
              <button
                @click="editor.chain().focus().toggleOrderedList().run()"
                :class="{ 'is-active': editor.isActive('orderedList') }"
              >
                Numrerad Lista
              </button>
              <button
                @click="editor.chain().focus().toggleCodeBlock().run()"
                :class="{ 'is-active': editor.isActive('codeBlock') }"
              >
                Kodblock
              </button>
              <button
                @click="editor.chain().focus().toggleBlockquote().run()"
                :class="{ 'is-active': editor.isActive('blockquote') }"
              >
                Blockquote
              </button>
              <button @click="editor.chain().focus().setHorizontalRule().run()">
                Horisontell linje
              </button>
              <button @click="editor.chain().focus().setHardBreak().run()">
                Radbrytning
              </button>
              <button
                @click="editor.chain().focus().undo().run()"
                :disabled="!editor.can().chain().focus().undo().run()"
              >
                Ångra
              </button>
              <button
                @click="editor.chain().focus().redo().run()"
                :disabled="!editor.can().chain().focus().redo().run()"
              >
                Gör Om
              </button>
              <input type="color" v-model="pickedBackgroundColor" />

              <button @click="unsetBackgroundColor()">
                Ta Bort Bakgrundsfärg
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <button
              v-if="!state.isEditable"
              @click="toggleEditable"
              class="btn btn-info"
            >
              Redigera
            </button>
            <button v-else class="btn btn-info" @click="toggleEditable">
              Sluta Redigera
            </button>
            <button class="btn btn-success" @click="saveDocument">Spara</button>
            <button
              v-if="!state.areUSure"
              class="btn btn-error"
              @click="state.areUSure = true"
            >
              Radera
            </button>
            <div class="text-center" v-if="state.areUSure">
              <p class="m-2 text-info">
                <span class="text-error">RADERA:</span> <br />
                Är Du Säker?
              </p>
              <div>
                <button class="btn btn-info" @click="state.areUSure = false">
                  Nej
                </button>
                <button class="btn btn-error" @click="deleteDocument">
                  Ja
                </button>
              </div>
            </div>
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
  padding: 10px;
  border: none;
  background-color: #002b49;
  color: #fff;
  border-radius: 30px;
  cursor: pointer;
}

.editorOptions button:hover {
  background-color: #00528d;
  color: #fff;
}

.is-active {
  background-color: #3074a5;
  color: #fff;
}
.newDocContainer {
  width: 30%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 10px;
  background-color: #223e6059;
  padding: 30px;
}
</style>
