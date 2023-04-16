<script lang="ts">
import { defineComponent, reactive, ref } from "vue";

export default defineComponent({
  name: "LoginPage",
  setup( prop, {emit}) {
    const state = reactive({
      createUser: false,
      wrongLogin: false,
      emptyfields: false,
      passwordNotMatch: false,
      userCreated: false,
    });
    
    const loginAttempt = reactive({
      name: "",
      password: "",
    });
    const newUser = reactive({
      name: "",
      password: "",
      confirmPassword: "",
    });
    

    function emitLoggin(userInfo: any)  { // TODO: Fix type
      console.log('Emitting: ' + userInfo.username + ' ' + userInfo.id)
      emit("loginSuccess", userInfo);
    }

    async function attemptToLogin() {
      if (loginAttempt.name === "" || loginAttempt.password === "") {
        state.emptyfields = true;
        state.wrongLogin = false;
        return;
      }
      try {
        const response = await fetch("http://localhost:3000/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: loginAttempt.name,
            password: loginAttempt.password,
          }),
        });


        if (!response.ok) {
          loginAttempt.password = "";
          state.wrongLogin = true;
          return;
        }
        const data = await response.json();

        state.wrongLogin = false;
        state.emptyfields = false;

        loginAttempt.name = "";
        loginAttempt.password = "";
        emitLoggin(data.user);
        console.log("Logged In User:", data);
      } catch (err) {
        console.error("Error:", err);
      }
    }

    async function createUser() {
      if (
        newUser.name === "" ||
        newUser.password === "" ||
        newUser.confirmPassword === ""
      ) {
        state.emptyfields = true;
        state.passwordNotMatch = false;
        return;
      }
      if (newUser.password !== newUser.confirmPassword) {
        state.passwordNotMatch = true;
        return;
      }
      try {
        const response = await fetch("http://localhost:3000/users/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newUser.name,
            password: newUser.password,
          }),
        });
        if (!response.ok) {
          console.log("Error");
          return;
        }
        const data = await response.json();

        console.log("New User:", data);
        state.createUser = false;
        state.emptyfields = false;
        state.passwordNotMatch = false;
        newUser.name = "";
        newUser.password = "";
        newUser.confirmPassword = "";
        state.userCreated = true;
      } catch (err) {
        console.error("Error:", err);
      }
    }
    return {
        state,
        loginAttempt,
        newUser,
        attemptToLogin,
        createUser,
    };
  },
});
</script>

<template>
  <section class="p-8 w-1/2 loginPage shadow-2xl">
    <div class="w-full h-full flex justify-center content-center">
      <div
        v-if="!state.createUser"
        class="flex flex-col justify-center gap-2 text-center"
      >
        <h2 class="text-4xl mb-2 text-primary">Login</h2>
        <div class="flex flex-col loginform">
          <label class="text-accent text-xl" for="username">Användarnamn:</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Ditt användarnamn"
            v-model="loginAttempt.name"
            class="input input-bordered input-info w-full max-w-xs"
          />
          <label class="text-accent text-xl" for="password">Lösenord:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Lösenord"
            v-model="loginAttempt.password"
            class="input input-bordered input-info w-full max-w-xs"
          />
        </div>
        <div v-if="state.userCreated" class="alert alert-success shadow-lg">
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
            <span>Användare Skapad: Vänligen Logga in.</span>
          </div>
        </div>
        <div
          v-if="state.emptyfields || state.wrongLogin"
          class="alert alert-warning shadow-lg"
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span
              >Varning:
              <span v-if="!state.emptyfields">Fel Inloggnings Uppgifter!</span>
              <span v-if="state.emptyfields">Fälten Är Tomma!</span>
            </span>
          </div>
        </div>
        <button
          @click="attemptToLogin"
          class="mt-2 btn btn-outline btn-primary"
        >
          Logga in
        </button>
        <button class="mt-4" @click="state.createUser = true">
          Skapa Ny Användare
        </button>
      </div>
      <div
        v-if="state.createUser"
        class="flex flex-col justify-center text-center"
      >
        <h2 class="text-2xl mb-4">Skapa Ny Användare:</h2>
        <div class="flex flex-col gap-2">
          <label class="text-accent" for="username"
            >Användarnamn:
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Användarnamn"
              v-model="newUser.name"
              class="input input-bordered input-info w-full max-w-xs"
            />
          </label>

        
          <label class="text-accent" for="password"
            >Lösenord:
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Lösenord"
              v-model="newUser.password"
              class="input input-bordered input-info w-full max-w-xs"
            />
          </label>
          <label class="text-accent" for="password"
            >Bekräfta Lösenord:
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Lösenord"
              v-model="newUser.confirmPassword"
              class="input input-bordered input-info w-full max-w-xs"
            />
          </label>
          <div
            v-if="state.emptyfields || state.passwordNotMatch"
            class="alert alert-warning shadow-lg"
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                Varning:
                <span v-if="state.passwordNotMatch"
                  >Lösenorden Matcher inte!</span
                >
                <span v-if="!state.passwordNotMatch">Fälten Är Tomma!</span>
              </span>
            </div>
          </div>
          <button @click="createUser()" class="btn btn-outline btn-success">
            Skapa Användare
          </button>
        </div>
        <button @click="state.createUser = false" class="mt-4">
          Tillbaka Till Login
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  margin: 0 auto;
  background-color: rgba(0, 32, 64, 0.821);
 
}

.orderHistoryList > li:nth-child(odd) {
  background-color: rgb(0, 26, 45);
}
.orderHistoryList > li:nth-child(even) {
  background-color: rgb(5, 37, 48);
}

.mainSection {
  min-height: 90vh;
  max-width: 2200px;
}
.loginform {
  background-color: rgba(5, 113, 149, 0.391);
  padding: 20px 30px;
  border-radius: 10px;
}

.cartSection {
  background-color: rgba(5, 113, 149, 0.391);
  padding: 20px 30px;
  margin-right: 20px;
}
.orderHistory {
  padding: 50px 30px;
  background-color: rgb(0, 17, 34);
  min-height: 90vh;
}

.orderHistory > div {
  background-color: rgba(26, 48, 73, 0.81);
  padding: 20px 30px;
  border-radius: 10px;
  margin: 0 auto;
  margin-top: 20px;
  width: 80%;
  height: 80%;
  overflow: scroll;
  position: relative;
}

.orderItems {
  background-color: rgba(5, 113, 149, 0.391);
  padding: 10px 20px;
  border-radius: 10px;
}

.loginPage {
  border-radius: 30px 0;
}
</style>
