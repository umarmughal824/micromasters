// @flow
import React from "react"
import { Card } from "react-mdl/lib/Card"
import Icon from "react-mdl/lib/Icon"

import type { Program } from "../flow/programTypes"

type DiscussionCardProps = {
  program: Program
}

const DiscussionCard = ({ program }: DiscussionCardProps) => (
  <Card className="discussion-card" shadow={0}>
    <div className="discussions-link">
      <Icon name="forum" />
      <a href="/discussions" target="_blank" rel="noopener noreferrer">
        MicroMasters Discussion
      </a>
    </div>
    <p>Discuss the {program.title} MicroMasters with other learners.</p>
  </Card>
)

export default DiscussionCard
