<template>
  <div style="margin-top:100px;">
    <v-row v-if="loggedIn" align="center" justify="center">
      <h1>Hello</h1>
    </v-row>

    <div v-else>
      <v-row  align="center" justify="center">
        <p>peaceBoxはTwitterでログインしてのみご利用いただけます。</p>
      </v-row>
      <v-row align="center" justify="center" style="margin-top:30px;">
        <v-btn large color="#4CBADD" style="color:#ffffff;">Twitterでログイン</v-btn>
      </v-row>
    </div>

  </div>
</template>

<script>
export default {
  data:()=>{
    return{loggedIn:false}
  }
}
</script>

<style>
p{
  size:20px;
  font-weight: 600;
}
</style>
