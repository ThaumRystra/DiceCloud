<template lang="html">
  <div class="skill-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          :label="$t('AttributeForm.vWQj52YzUPPcXSMEZ6dvh')"
          :value="model.variableName"
          style="flex-basis: 300px;"
          :hint="$t('SkillForm.FwTi5l87wO7XVQizFa3Bk')"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-combobox
          :label="$t('CheckInput.ZOqgwwG1rCTTKIVrY23XB')"
          :value="model.ability"
          style="flex-basis: 300px;"
          :hint="$t('SkillForm.fIJDr4ZD2k-67ZQHSOJGZ')"
          :items="abilityScoreList"
          :error-messages="errors.ability"
          @change="change('ability', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-select
          :label="$t('TreeSearchInput.BAArIlU-xLOyjxKLYTPg7')"
          clearable
          :items="skillTypes"
          :value="model.skillType"
          :error-messages="errors.skillType"
          :menu-props="{auto: true, lazy: true}"
          :hint="skillTypeHints[model.skillType]"
          @change="change('skillType', ...arguments)"
        />
      </v-col>
    </v-row>
    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections type="skill">
      <form-section :name="$t('SkillForm.xEYh2FhucUyfpFeOiCK1t')">
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <proficiency-select
              :label="$t('SkillForm.go1fZMjOamVypbpskbqZD')"
              :value="model.baseProficiency"
              :error-messages="errors.baseProficiency"
              @change="change('baseProficiency', ...arguments)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <computed-field
              :label="$t('AttributeForm.sg1vCF4ceatDzU2Y3bUbw')"
              :hint="$t('SkillForm.0RIVS1iiSps7zFgRhCU-i')"
              :model="model.baseValue"
              :error-messages="errors.baseValue"
              @change="({path, value, ack}) =>
                $emit('change', {path: ['baseValue', ...path], value, ack})"
            />
          </v-col>
        </v-row>
      </form-section>
      <form-section :name="$t('SkillForm.p09IUwxeRXWEUnNOBsawW')">
        <smart-switch
          :label="$t('SkillForm.3S6BJ3LTSnpNl_2YJ5xbn')"
          :value="model.targetByTags"
          :error-messages="errors.targetByTags"
          @change="change('targetByTags', ...arguments)"
        />
        <v-expand-transition>
          <tag-targeting
            v-if="model.targetByTags"
            :model="model"
            :errors="errors"
            @change="e => $emit('change', e)"
            @push="e => $emit('push', e)"
            @pull="e => $emit('pull', e)"
          />
        </v-expand-transition>
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import ProficiencySelect from '/imports/client/ui/properties/forms/shared/ProficiencySelect.vue';
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import createListOfProperties from '/imports/client/ui/properties/forms/shared/lists/createListOfProperties';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

export default {
  components: {
    ProficiencySelect,
    FormSection,
    TagTargeting,
  },
  mixins: [propertyFormMixin],
  data() {
    return {
      skillTypes: [
        {
          text: this.$t('CheckInput.sKXmebGzd92GfO5RYbSPI'),
          value: 'skill',
        }, {
          text: this.$t('ImageInputDialog.dcbgmuOVYglN2J7VpTBFU'),
          value: 'save',
        }, {
          text: this.$t('SelectedCreatureBar.UcAwEN_Jmv7Lezh-o8g6S'),
          value: 'check',
        }, {
          text: this.$t('SkillForm.xayNU3cxaIOtLz1iCrUX_'),
          value: 'tool',
        }, {
          text: this.$t('SkillForm._uUQIQfQJm94jRvJnoCa4'),
          value: 'weapon',
        }, {
          text: this.$t('StatsTab.HuxcSGUjObZNOlWVKkZG4'),
          value: 'armor',
        }, {
          text: this.$t('SkillForm.PfUrjVRAHmEX7AhfxnPTT'),
          value: 'language',
        }, {
          text: this.$t('AttributeForm.QUnXaen7rDzDb624npbUE'),
          value: 'utility',
        },
      ],
      skillTypeHints: {
        skill: this.$t('SkillForm.3HmLC1Cet1hnDeYhuhOal'),
        'save': this.$t('SkillForm.1yXeNttBJlQ8NHU6WBTN6'),
        'check': this.$t('SkillForm.XiqWCVYk6vLFjbduURJol'),
        'tool': this.$t('SkillForm.bBD23OFYb7fRB1V9BS0P-'),
        'weapon': this.$t('SkillForm.9c_kA3_kdX2DHMkeJluW5'),
        'armor': this.$t('SkillForm.fX2vgMPC31V0qW12rcolL'),
        'language': this.$t('SkillForm.gAlgFXNb94543om00oR51'),
        'utility': this.$t('SkillForm.s74pIwtTO9_roPkhjJO6f'),
      }
    };
  },
  meteor: {
    abilityScoreList() {
      return createListOfProperties({
        type: 'attribute',
        attributeType: 'ability',
      });
    },
  },
};
</script>

<style lang="css" scoped>

</style>
