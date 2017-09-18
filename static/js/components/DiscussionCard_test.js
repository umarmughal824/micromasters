// @flow
import React from "react"
import { shallow } from "enzyme"
import { assert } from "chai"

import DiscussionCard from "./DiscussionCard"

import { DASHBOARD_RESPONSE } from "../test_constants"

describe("DiscussionCard", () => {
  const program = DASHBOARD_RESPONSE.programs[0]

  it("should render what we expect", () => {
    const wrapper = shallow(<DiscussionCard program={program} />)
    const linkProps = wrapper.find("a").props()
    assert.equal(linkProps.href, "/discussions")
    assert.equal(linkProps.children, "MicroMasters Discussion")
    assert.equal(linkProps.target, "_blank")
    const paraProps = wrapper.find("p").props()
    assert.equal(
      paraProps.children.join(""),
      `Discuss the ${program.title} MicroMasters with other learners.`
    )
  })
})
