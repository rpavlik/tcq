import Vue from 'vue';
import './footer.scss';
import template from './footer.html';

const Footer = template(
  Vue.extend({
    props: {
      user: undefined,
      userSourceDescription: undefined,
    },
    created() {
      this.userSourceDescription = (window as any).userSourceDescription;
      this.user = (window as any).user;
    },
  })
);

export default Footer;
