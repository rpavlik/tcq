import Vue from 'vue';
import Speaker from '../../../shared/Speaker';
import template from './CurrentSpeaker.html';
import * as Message from '../../../shared/Messages';
import { request } from '../../ClientSocket';

export const CurrentSpeaker = template(
  Vue.extend({
    data() {
      return {
        loading: false
      };
    },
    props: {
      speaker: {
        default: null as Speaker | null
      }
    },
    methods: {
      async doneSpeaking() {
        this.loading = true;
        try {
          await request('nextSpeaker', {
            currentSpeakerId: this.speaker ? this.speaker.id : undefined
          } as Message.NextSpeakerRequest);
        } finally {
          this.loading = false;
        }
      }
    },
    computed: {
      isMe(): boolean {
        return this.speaker.user.user_id === (this.$root as any).user.user_id;
      },
    },
  })
);
