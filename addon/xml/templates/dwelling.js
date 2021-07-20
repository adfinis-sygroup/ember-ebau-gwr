//prettier-ignore
export const modifyDwelling =
`{{#>base}}
  <ns2:modifyDwelling>
    {{> Dwelling}}
    <ns2:reason>
      {{reason}}
    </ns2:reason>
  </ns2:modifyDwelling>
{{/base}}`;

//prettier-ignore
export const addDwelling =
`{{#>base}}
  <ns2:addDwellingToConstructionProject>
    {{> Dwelling}}
    <ns2:reason>
      {{reason}}
    </ns2:reason>
  </ns2:addDwellingToConstructionProject>
{{/base}}`;

//prettier-ignore
export const deactivateDwelling =
`{{#>base}}
  <ns2:deactivateDwelling>
    <ns2:reason>
      {{reason}}
    </ns2:reason>
  </ns2:deactivateDwelling>
{{/base}}`;

//prettier-ignore
export const reallocateDwelling =
`{{#>base}}
  <ns2:reallocateDwelling>
    <ns2:oldEDID>{{model.oldEDID}}</ns2:oldEDID>
    <ns2:newEDID>{{model.newEDID}}</ns2:newEDID>
    <ns2:reason>
      {{reason}}
    </ns2:reason>
  </ns2:reallocateDwelling>
{{/base}}`;

//prettier-ignore
export const setToDwellingConstructionStarted =
`{{#>base}}
  <ns2:setToDwellingConstructionStarted>
  </ns2:setToDwellingConstructionStarted>
{{/base}}`;

// setToCompletedDwelling
// setToNotRealizedDwelling
// setToUnusableDwelling

//prettier-ignore
export const setToDemolishedDwelling =
`{{#>base}}
  <ns2:setToDemolishedDwelling>
  {{#if model.yearOfDemolition}}
    <ns2:dateOfDemolition>
      <year>{{model.yearOfDemolition}}</year>
    </ns2:dateOfDemolition>
  {{else}}
    <ns2:dateOfDemolition>
      <year>{{echDate "today" "year"}}</year>
    </ns2:dateOfDemolition>
  {{/if}}
  </ns2:setToDemolishedDwelling>
{{/base}}`;
