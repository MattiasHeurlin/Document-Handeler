<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from "vue";

export default defineComponent({
  name: "StoredDocuments",
  props: {
    userId: String,
  },
  setup(props, { emit }) {
    const userDocuments = ref([] as Document[]);
    function updateSelectedDocument(document: Document) {
      emit("updateSelectedContent", document);
    }
    interface Document {
      title: string;
      id: string;
      content: string;
    }
    onMounted(() => {
      try {
        fetch("http://localhost:3000/documents/" + props.userId)
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              console.log( data.error)
            }
            userDocuments.value = data;
          });
      } catch (error) {
        console.log(error);
      }});
     
    return {
      userDocuments,
      updateSelectedDocument,
    };
  }
});

</script>

<template>

<ul v-if="userDocuments.length > 0" class="flex flex-col justify-evenly">
  <li @click="updateSelectedDocument(document)" v-for="document in userDocuments" :key="document.id">
    {{ document.title }}
  </li>
</ul>

</template>

<style scoped>
  li {
    list-style: none;
    border: 1px solid black;
    padding: 1.1rem;
    margin: 1rem;
    color: rgb(223, 246, 255);
    background-color: #1f2937;
    font-size: 1.2rem;
    max-width: 400px;
  }
</style>
