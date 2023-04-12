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



<ul v-if="userDocuments.length > 0" class="flex flex-col m-2 gap-2 justify-evenly overflow-y-auto">
  <li @click="updateSelectedDocument(document)" v-for="document in userDocuments" :key="document.id">
    {{ document.title }}
  </li>

</ul>

</template>

<style scoped>
  li {
    list-style: none;
    border: 1px solid black;
    padding: 10px;
    color: rgb(4, 249, 192);
    background-color: #1f2937;
    font-size: 1.2rem;
    max-width: 400px;
  }
  li:hover {
    background-color: #1b4588;
    cursor: pointer;
  }

  
</style>
