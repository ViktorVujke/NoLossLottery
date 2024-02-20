import '../SectionComponents/SectionComponents.css'

function CreateLotterySection({openLotteryCreateModal}){
    return(
        <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
<button class="ui-btn" style={{padding:'20px', width:'85%'}} onClick={()=>openLotteryCreateModal(true)}>
  <span>
    Create a new lottery 
  </span>
</button>        </div>
    )
}

export default CreateLotterySection