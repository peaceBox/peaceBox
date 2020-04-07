<template>
    <v-navigation-drawer  :value="value" @input="emitEvt($event)" app>
      <v-list dense>

        <v-list-item v-for="(item,index) in menu" :key="index" link>
          <v-list-item-action>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{item.title}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      
      </v-list>
    </v-navigation-drawer>
</template>

<script>
export default {
  name:"navigator",
  props: ['value'],
  data:()=>{
    return {menu:[{icon:"mdi-home",title:"Home"},{icon:"mdi-contact-mail",title:"Contact"}]}
  },
  methods:{
    emitEvt:function(e){
      this.$emit('input', e)
    }
  }
}
</script>
